from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends
from sqlmodel import Session

from quiver.auth.dependencies import require_authenticated
from quiver.dashboard.registry import get_widgets
from quiver.database.session import get_db


def create_dashboard_router() -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["dashboard"])

    @router.get("/dashboard")
    async def get_dashboard(
        db: Session = Depends(get_db),
        payload: dict = Depends(require_authenticated),
    ):
        widgets = get_widgets()
        user_perms = set(payload.get("permissions", []))
        is_super = bool(payload.get("is_superuser"))

        # Filter widgets the user has permission to see
        visible = [
            w for w in widgets if w.permission is None or is_super or w.permission in user_perms
        ]

        if not visible:
            return []

        # Execute all widgets in parallel, isolating failures
        async def safe_fetch(widget):
            try:
                data = await widget.fetch_data(db, payload)
                return widget.to_dict(data)
            except Exception:
                return None

        results = await asyncio.gather(*[safe_fetch(w) for w in visible], return_exceptions=False)
        return [r for r in results if r is not None]

    return router
