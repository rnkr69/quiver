from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session

from quiver.auth.dependencies import require_permission
from quiver.database.session import get_db
from quiver.rbac import schemas, service


def create_rbac_router() -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["roles"])

    @router.get("/roles", response_model=list[schemas.RoleResponse])
    def list_roles(
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("roles.list")),
    ):
        return service.get_roles_with_stats(db)

    @router.get("/roles/{role_id}", response_model=schemas.RoleDetailResponse)
    def get_role(
        role_id: str,
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("roles.list")),
    ):
        return service.get_role_detail(role_id, db)

    @router.post("/roles", response_model=schemas.RoleResponse, status_code=201)
    def create_role(
        body: schemas.RoleCreate,
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("roles.create")),
    ):
        role = service.create_role(body, db)
        return schemas.RoleResponse(
            id=str(role.id), name=role.name,
            display_name=role.display_name, description=role.description,
            permissions_count=0, users_count=0,
        )

    @router.put("/roles/{role_id}", response_model=schemas.RoleResponse)
    def update_role(
        role_id: str,
        body: schemas.RoleUpdate,
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("roles.update")),
    ):
        role = service.update_role(role_id, body, db)
        stats = service.get_roles_with_stats(db)
        stat = next((s for s in stats if s.id == str(role.id)), None)
        return stat or schemas.RoleResponse(
            id=str(role.id), name=role.name,
            display_name=role.display_name, description=role.description,
            permissions_count=0, users_count=0,
        )

    @router.delete("/roles/{role_id}", status_code=204)
    def delete_role(
        role_id: str,
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("roles.delete")),
    ):
        service.delete_role(role_id, db)

    @router.get("/permissions", response_model=list[schemas.PermissionGroupResponse])
    def list_permissions(
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("roles.list")),
    ):
        return service.get_permissions_grouped(db)

    @router.put("/roles/{role_id}/permissions", status_code=204)
    def replace_role_permissions(
        role_id: str,
        body: schemas.RolePermissionsUpdate,
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("roles.update")),
    ):
        service.replace_role_permissions(role_id, body.permission_ids, db)

    return router
