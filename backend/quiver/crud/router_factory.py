from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlmodel import Session, select, col

from quiver.auth.dependencies import require_authenticated, require_permission
from quiver.database.session import get_db


def create_crud_router(crud_class) -> APIRouter:
    """Generate an APIRouter with 7 standard CRUD endpoints + choices."""
    from quiver.crud.schema_factory import create_schemas

    model = crud_class.model
    resource = getattr(crud_class, "route", model.__name__.lower())
    perm_group = crud_class._permission_group() if hasattr(crud_class, "_permission_group") else resource
    page_size_default = getattr(crud_class, "page_size", 25)
    search_fields = getattr(crud_class, "search_fields", [])
    default_order = getattr(crud_class, "order_by", None)
    filters_decl = getattr(crud_class, "filters", [])

    CreateSchema, UpdateSchema, ReadSchema = create_schemas(crud_class)

    crud_instance = crud_class()  # instantiate for hook calls
    router = APIRouter(prefix=f"/admin/{resource}", tags=[resource])

    # ── GET /config ─────────────────────────────────────────────────────────

    @router.get("/config")
    async def get_config(
        payload: dict = Depends(require_permission(f"{perm_group}.list")),
    ):
        cols = [c.to_dict() for c in crud_instance._get_effective_columns()]
        fields = [f.to_dict() for f in crud_instance._get_effective_fields()]
        filter_dicts = [f.to_dict() for f in filters_decl]

        user_perms = set(payload.get("permissions", []))
        is_super = bool(payload.get("is_superuser"))
        perm_map = {}
        for action in ("list", "create", "show", "update", "delete"):
            perm_name = f"{perm_group}.{action}"
            perm_map[action] = is_super or perm_name in user_perms

        return {
            "resource": resource,
            "title": getattr(crud_class, "title", None) or resource.replace("_", " ").title(),
            "permissions": perm_map,
            "columns": cols,
            "fields": fields,
            "filters": filter_dicts,
            "bulk_actions": getattr(crud_class, "bulk_actions", ["delete"]),
            "page_size": page_size_default,
            "order_by": default_order,
        }

    # ── GET / (list) ─────────────────────────────────────────────────────────

    @router.get("/", response_model=dict)
    async def list_items(
        request: Request,
        page: int = Query(1, ge=1),
        page_size: int = Query(page_size_default, ge=1, le=500),
        search: Optional[str] = Query(None),
        order_by: Optional[str] = Query(None),
        order_dir: Optional[str] = Query("asc"),
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission(f"{perm_group}.list")),
    ):
        base_q = await crud_instance.get_queryset(db, payload)

        # search
        if search and search_fields:
            from sqlalchemy import or_
            conditions = []
            for sf in search_fields:
                attr = getattr(model, sf, None)
                if attr is not None:
                    conditions.append(attr.ilike(f"%{search}%"))
            if conditions:
                base_q = base_q.where(or_(*conditions))

        # filters from query params
        for f_decl in filters_decl:
            value = request.query_params.get(f_decl.key)
            if value is not None and value != '':
                base_q = f_decl.apply(base_q, value, model)

        # ordering
        sort_key = order_by or (default_order.lstrip("-") if default_order else None)
        sort_desc = (order_dir == "desc") or (default_order and default_order.startswith("-"))
        if sort_key:
            attr = getattr(model, sort_key, None)
            if attr is not None:
                base_q = base_q.order_by(col(attr).desc() if sort_desc else col(attr).asc())

        total = len(db.exec(base_q).all())
        offset = (page - 1) * page_size
        base_q = base_q.offset(offset).limit(page_size)
        items = db.exec(base_q).all()

        return {
            "items": [i.model_dump() for i in items],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": max(1, (total + page_size - 1) // page_size),
        }

    # ── POST / (create) ──────────────────────────────────────────────────────

    @router.post("/", response_model=dict, status_code=201)
    async def create_item(
        body: CreateSchema,  # type: ignore[valid-type]
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission(f"{perm_group}.create")),
    ):
        data = await crud_instance.before_create(body.model_dump(exclude_none=False), db, payload)
        instance = model(**data)
        db.add(instance)
        db.commit()
        db.refresh(instance)
        await crud_instance.after_create(instance, db, payload)
        return instance.model_dump()

    # ── GET /choices ─────────────────────────────────────────────────────────

    @router.get("/choices")
    async def choices(
        label_field: str = Query("name"),
        value_field: str = Query("id"),
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission(f"{perm_group}.list")),
    ):
        base_q = await crud_instance.get_queryset(db, payload)
        items = db.exec(base_q).all()
        result = []
        for item in items:
            result.append({
                "value": getattr(item, value_field, None),
                "label": getattr(item, label_field, None),
            })
        return result

    # ── GET /{id} (show) ─────────────────────────────────────────────────────

    @router.get("/{item_id}", response_model=dict)
    async def get_item(
        item_id: str,
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission(f"{perm_group}.show")),
    ):
        instance = db.get(model, item_id)
        if not instance:
            from quiver.exceptions import QuiverNotFound
            raise QuiverNotFound(f"{resource} '{item_id}' not found.")
        return instance.model_dump()

    # ── PUT /{id} (update) ───────────────────────────────────────────────────

    @router.put("/{item_id}", response_model=dict)
    async def update_item(
        item_id: str,
        body: UpdateSchema,  # type: ignore[valid-type]
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission(f"{perm_group}.update")),
    ):
        instance = db.get(model, item_id)
        if not instance:
            from quiver.exceptions import QuiverNotFound
            raise QuiverNotFound(f"{resource} '{item_id}' not found.")

        data = await crud_instance.before_update(
            body.model_dump(exclude_none=True), db, payload
        )
        for k, v in data.items():
            if hasattr(instance, k):
                setattr(instance, k, v)
        db.add(instance)
        db.commit()
        db.refresh(instance)
        await crud_instance.after_update(instance, db, payload)
        return instance.model_dump()

    # ── DELETE /{id} (delete single) ─────────────────────────────────────────

    @router.delete("/{item_id}", status_code=204)
    async def delete_item(
        item_id: str,
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission(f"{perm_group}.delete")),
    ):
        instance = db.get(model, item_id)
        if not instance:
            from quiver.exceptions import QuiverNotFound
            raise QuiverNotFound(f"{resource} '{item_id}' not found.")
        await crud_instance.before_delete(instance, db, payload)
        db.delete(instance)
        db.commit()
        await crud_instance.after_delete(item_id, db, payload)

    # ── DELETE / (bulk delete) ────────────────────────────────────────────────

    @router.delete("/", status_code=204)
    async def bulk_delete(
        ids: list[str],
        db: Session = Depends(get_db),
        payload: dict = Depends(require_permission(f"{perm_group}.delete")),
    ):
        for item_id in ids:
            instance = db.get(model, item_id)
            if instance:
                await crud_instance.before_delete(instance, db, payload)
                db.delete(instance)
        db.commit()

    return router
