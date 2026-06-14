from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session

from quiver.auth.dependencies import require_authenticated
from quiver.database.session import get_db
from quiver.exceptions import QuiverBadRequest, QuiverNotFound
from quiver.portal.schemas import ProfileUpdate


def create_portal_router() -> APIRouter:
    router = APIRouter(prefix="/portal", tags=["portal"])

    @router.get("/")
    async def portal_welcome(
        payload: dict = Depends(require_authenticated),
        db: Session = Depends(get_db),
    ):
        from quiver.config import get_config
        from quiver.models.admin_user import AdminUser

        config = get_config()
        if config.QUIVER_ENV == "production":
            return {"message": config.QUIVER_PORTAL_WELCOME_MESSAGE}
        user = db.get(AdminUser, payload["sub"])
        name = f"{user.first_name} {user.last_name}".strip() if user else ""
        return {
            "message": "Bienvenido al portal — modo development",
            "env": "development",
            "version": "1.0.0",
            "user": {
                "name": name,
                "roles": payload.get("roles", []),
            },
        }

    @router.get("/me")
    async def get_profile(
        payload: dict = Depends(require_authenticated),
        db: Session = Depends(get_db),
    ):
        from sqlmodel import select

        from quiver.models.admin_user import AdminUser
        from quiver.models.associations import UserHasRole
        from quiver.models.role import Role

        user_id: str = payload["sub"]
        user = db.get(AdminUser, user_id)
        if not user:
            raise QuiverNotFound("Usuario no encontrado")
        role_ids = db.exec(select(UserHasRole.role_id).where(UserHasRole.user_id == user_id)).all()
        role_names = []
        for rid in role_ids:
            role = db.get(Role, rid)
            if role:
                role_names.append(role.display_name)
        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "roles": role_names,
            "created_at": user.created_at,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
        }

    @router.put("/me")
    async def update_profile(
        data: ProfileUpdate,
        payload: dict = Depends(require_authenticated),
        db: Session = Depends(get_db),
    ):
        from quiver.auth.password import hash_password, verify_password
        from quiver.models.admin_user import AdminUser

        user_id: str = payload["sub"]
        user = db.get(AdminUser, user_id)
        if not user:
            raise QuiverNotFound("Usuario no encontrado")

        if data.new_password:
            if not data.current_password:
                raise QuiverBadRequest("current_password es obligatorio para cambiar la contraseña")
            if not verify_password(data.current_password, user.password_hash):
                raise QuiverBadRequest("La contraseña actual es incorrecta")
            user.password_hash = hash_password(data.new_password)

        if data.first_name is not None:
            user.first_name = data.first_name
        if data.last_name is not None:
            user.last_name = data.last_name

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
        }

    return router
