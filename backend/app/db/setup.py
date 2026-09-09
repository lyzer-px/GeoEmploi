from sqlalchemy.orm import Session
from sqlalchemy import select

from .models import Permission
from app.core.permissions import Action, Resource, perm
from app.core.roles import (
    get_permissions,
    get_admin_permissions,
    get_or_create_role,
    assign_permissions,
)


def init_permissions(db: Session) -> None:
    """Create missing default permissions in the database."""
    permissions = {perm(action, resource) for action in Action for resource in Resource}
    existing_permissions = set(db.scalars(select(Permission.name)).all())
    missing_permissions = permissions - existing_permissions

    if not missing_permissions:
        return
    db.add_all(Permission(name=name) for name in missing_permissions)
    db.commit()


def init_roles(
    db: Session,
    roles_definition: dict,
) -> None:
    permissions = get_permissions(db)

    for role_name, definition in roles_definition.items():
        role = get_or_create_role(
            db=db,
            role_name=role_name,
            description=definition["description"],
            is_self_assignable=definition["is_self_assignable"],
        )
        permission_names = definition["permissions"]
        if role_name == "admin":
            permission_names = get_admin_permissions(permissions)
        assign_permissions(
            role=role,
            permission_names=permission_names,
            permissions=permissions,
        )
    db.commit()
