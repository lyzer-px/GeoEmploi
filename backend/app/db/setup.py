from sqlalchemy.orm import Session
from sqlalchemy import select

from .models import Permission
from app.core.permissions import Action, Resource, perm


def init_permissions(db: Session) -> None:
    """Create missing default permissions in the database."""
    permissions = {
        perm(action, resource)
        for action in Action
        for resource in Resource
    }
    existing_permissions = set(
        db.scalars(
            select(Permission.name)
        ).all()
    )
    missing_permissions = permissions - existing_permissions

    if not missing_permissions:
        return
    db.add_all(
        Permission(name=name)
        for name in missing_permissions
    )
    db.commit()