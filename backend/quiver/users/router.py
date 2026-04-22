from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session

from quiver.auth.dependencies import require_permission
from quiver.database.session import get_db
from quiver.users import schemas, service


def create_users_router() -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["users"])

    @router.get("/users", response_model=list[schemas.UserListResponse])
    def list_users(
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("users.list")),
    ):
        return service.list_users(db)

    @router.post("/users", response_model=schemas.UserResponse, status_code=201)
    def create_user(
        body: schemas.UserCreate,
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("users.create")),
    ):
        return service.create_user(body, db)

    @router.get("/users/{user_id}", response_model=schemas.UserResponse)
    def get_user(
        user_id: str,
        db: Session = Depends(get_db),
        _: dict = Depends(require_permission("users.show")),
    ):
        return service.get_user(user_id, db)

    @router.put("/users/{user_id}", response_model=schemas.UserResponse)
    def update_user(
        user_id: str,
        body: schemas.UserUpdate,
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission("users.update")),
    ):
        current_user_id = payload.get("sub", "")
        return service.update_user(user_id, body, current_user_id, db)

    @router.delete("/users/{user_id}", status_code=204)
    def deactivate_user(
        user_id: str,
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission("users.delete")),
    ):
        current_user_id = payload.get("sub", "")
        service.deactivate_user(user_id, current_user_id, db)

    return router
