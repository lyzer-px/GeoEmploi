from typing import Optional, Sequence
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlmodel import select
from fastapi import status

from app.schemas.input.roles import RoleCreate
from app.db.database import get_db_session
from app.db.models import Permission, Role, User
from app.services.user_service import UserService, get_user_service


class RoleService:
    def __init__(self, session: Session, user_service: UserService):
        self._db: Session = session
        self._user_service: UserService = user_service

    def get_user_permissions(self, user: User) -> list[Permission]:
        """Retrieves all Permission objects associated with the users roles."""
        permissions_dict: dict[int, Permission] = {}

        for role in user.roles:
            for perm in role.permissions:
                permissions_dict[perm.id] = perm
        return list(permissions_dict.values())

    def get_user_permission_names(self, user: User) -> set[str]:
        """Retrieves the unique permission names (example: {'create:offer', 'read:offer'})."""
        return {perm.name for role in user.roles for perm in role.permissions}

    def has_permission(self, user: User, permission_name: str) -> bool:
        """Checks whether the User instance has a given permission."""
        return permission_name in self.get_user_permission_names(user)

    def assign_role_to_user(self, user: User, role_name: str) -> User:
        """Assigns a role to the provided User instance."""
        role = self.get_role_by_name(role_name)
        if not role:
            raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")

        if role not in user.roles:
            user.roles.append(role)
            try:
                self._db.commit()
                self._db.refresh(user)
            except Exception:
                self._db.rollback()
                raise HTTPException(
                    status_code=500, detail="Error assigning role to user."
                )

        return user

    def assign_self_assignable_role_to_user(self, user: User, role_name: str) -> User:
        """Assigns a self-assignable role to the user after validating permissions."""
        role = self.get_role_by_name(role_name)
        if not role:
            raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")
        if not role.is_self_assignable:
            raise HTTPException(
                status_code=403, detail=f"Role '{role_name}' cannot be self-assigned."
            )
        return self.assign_role_to_user(user, role_name)

    def remove_role_from_user(self, user: User, role_name: str) -> User:
        """Removes a role from the provided User instance."""
        role_to_remove = next((r for r in user.roles if r.name == role_name), None)
        if not role_to_remove:
            raise HTTPException(
                status_code=400,
                detail=f"User {user.id} does not have role '{role_name}'",
            )

        user.roles.remove(role_to_remove)
        try:
            self._db.commit()
            self._db.refresh(user)
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=500, detail="Error removing role from user."
            )

        return user

    def set_user_roles(self, user: User, role_names: list[str]) -> User:
        """Replace all of the user's roles."""
        statement = select(Role).where(Role.name.in_(role_names))
        roles = list(self._db.scalars(statement).all())

        if len(roles) != len(set(role_names)):
            raise HTTPException(
                status_code=404, detail="One or more specified roles were not found."
            )

        user.roles = roles
        try:
            self._db.commit()
            self._db.refresh(user)
        except Exception:
            self._db.rollback()
            raise HTTPException(status_code=500, detail="Error updating user roles.")

        return user

    def get_role_by_name(self, name: str) -> Optional[Role]:
        statement = select(Role).where(Role.name == name)
        return self._db.scalars(statement).first()

    def get_all_roles(self) -> Sequence[Role]:
        statement = select(Role)
        return self._db.scalars(statement).all()

    def _get_permissions_by_names(
        self, permission_names: list[str]
    ) -> list[Permission]:
        if not permission_names:
            return []
        unique_names = list(set(permission_names))
        statement = select(Permission).where(Permission.name.in_(unique_names))
        permissions = list(self._db.scalars(statement).all())

        if len(permissions) != len(unique_names):
            raise HTTPException(
                status_code=404,
                detail="One or more specified permissions were not found.",
            )
        return permissions

    def create_role(self, role_data: RoleCreate) -> Role:
        if self.get_role_by_name(role_data.name):
            raise HTTPException(
                status_code=409, detail=f"Role '{role_data.name}' already exists."
            )
        permissions: list[Permission] = self._get_permissions_by_names(
            role_data.permissions
        )
        new_role = Role(
            name=role_data.name,
            description=role_data.description,
            is_self_assignable=role_data.is_self_assignable,
            permissions=permissions,
        )
        self._db.add(new_role)
        try:
            self._db.commit()
            self._db.refresh(new_role)
            return new_role
        except Exception:
            self._db.rollback()
            raise HTTPException(status_code=500, detail="Error creating role.")

    def assign_permission_to_role(self, role_name: str, permission_name: str) -> Role:
        role = self.get_role_by_name(role_name)

        if not role:
            raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")
        statement_perm = select(Permission).where(Permission.name == permission_name)
        permission = self._db.scalars(statement_perm).first()
        if not permission:
            raise HTTPException(
                status_code=404, detail=f"Permission '{permission_name}' not found"
            )
        if permission not in role.permissions:
            role.permissions.append(permission)
            try:
                self._db.commit()
                self._db.refresh(role)
            except Exception:
                self._db.rollback()
                raise HTTPException(
                    status_code=500, detail="Error assigning permission to role."
                )
        return role

    def get_permission_by_name(self, name: str) -> Optional[Permission]:
        """Récupère une permission par son nom."""
        statement = select(Permission).where(Permission.name == name)
        return self._db.scalars(statement).first()

    def create_permission(self, name: str) -> Permission:
        if self.get_permission_by_name(name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Permission '{name}' already exists.",
            )

        new_permission = Permission(name=name)
        self._db.add(new_permission)

        try:
            self._db.commit()
            self._db.refresh(new_permission)
            return new_permission
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating permission.",
            )
    def update_role(self, role_id: int, role_data: RoleCreate) -> Role:
        role = self._db.get(Role, role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role {role_id} not found.",
            )
    
        existing_role = self.get_role_by_name(role_data.name)
    
        if existing_role and existing_role.id != role_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Role '{role_data.name}' already exists.",
            )
    
        permissions = self._get_permissions_by_names(
            role_data.permissions
        )
    
        role.name = role_data.name
        role.description = role_data.description
        role.is_self_assignable = role_data.is_self_assignable
        role.permissions = permissions
    
        try:
            self._db.commit()
            self._db.refresh(role)
            return role
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating role.",
            )
    
    def get_all_permissions(self) -> Sequence[Permission]:
        statement = select(Permission)
        return self._db.scalars(statement).all()


def get_role_service(
    session: Session = Depends(get_db_session),
    user_service: UserService = Depends(get_user_service),
) -> RoleService:
    return RoleService(session=session, user_service=user_service)
