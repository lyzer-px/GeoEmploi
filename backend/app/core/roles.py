from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Permission, Role
from app.core.permissions import Action, Resource, perm


ROLES_DEFINITION = {
    "job_seeker": {
        "description": "Default role for job seekers",
        "permissions": {
            perm(Action.CREATE, Resource.SKILL),
            perm(Action.CREATE, Resource.EXPERIENCE),
            perm(Action.CREATE, Resource.APPLICATION),
            perm(Action.UPDATE, Resource.SKILL),
            perm(Action.UPDATE, Resource.APPLICATION),
            perm(Action.UPDATE, Resource.EXPERIENCE),
            perm(Action.READ, Resource.APPLICATION),
            perm(Action.READ_ANY, Resource.OFFER),
            perm(Action.READ_ANY, Resource.SKILL),
            perm(Action.READ_ANY, Resource.EXPERIENCE),
        },
    },
    "employer": {
        "description": "Default role for employers",
        "permissions": {
            perm(Action.CREATE, Resource.OFFER),
            perm(Action.CREATE, Resource.SKILL),
            perm(Action.UPDATE, Resource.OFFER),
            perm(Action.UPDATE, Resource.SKILL),
            perm(Action.DELETE, Resource.OFFER),
            perm(Action.DELETE, Resource.SKILL),
            perm(Action.READ_ANY, Resource.OFFER),
            perm(Action.READ_ANY, Resource.SKILL),
            perm(Action.READ, Resource.APPLICATION),
            perm(Action.READ_ANY, Resource.EXPERIENCE),
        },
    },
    "admin": {
        "description": "Administrator role",
        "permissions": set(),
    },
}


def get_permissions(db: Session) -> dict[str, Permission]:
    return {
        permission.name: permission
        for permission in db.scalars(select(Permission)).all()
    }


def get_or_create_role(
    db: Session,
    role_name: str,
    description: str,
) -> Role:
    role = db.scalar(select(Role).where(Role.name == role_name))

    if role:
        return role
    role = Role(
        name=role_name,
        description=description,
        is_self_assignable=False,
    )
    db.add(role)
    db.flush()
    return role


def get_admin_permissions(
    permissions: dict[str, Permission],
) -> set[str]:
    return {
        permission_name for permission_name in permissions if ":any_" in permission_name
    }


def assign_permissions(
    role: Role,
    permission_names: set[str],
    permissions: dict[str, Permission],
) -> None:
    for permission_name in permission_names:
        permission = permissions.get(permission_name)

        if permission is None:
            raise RuntimeError(f"Permission '{permission_name}' does not exist.")

        if permission not in role.permissions:
            role.permissions.append(permission)
