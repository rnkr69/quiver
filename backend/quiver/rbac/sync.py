from __future__ import annotations

from sqlmodel import Session, select

from quiver.models.permission import Permission
from quiver.rbac.registry import get_registry


def sync_permissions(db: Session) -> int:
    """Upsert all registered permissions into the DB. Returns count of upserted rows."""
    registry = get_registry()
    if not registry:
        return 0

    upserted = 0
    for defn in registry.values():
        existing = db.exec(
            select(Permission).where(Permission.name == defn.name)
        ).first()

        if existing:
            existing.display_name = defn.display_name
            existing.group = defn.group
            db.add(existing)
        else:
            db.add(Permission(
                name=defn.name,
                display_name=defn.display_name,
                group=defn.group,
            ))
        upserted += 1

    db.commit()
    return upserted
