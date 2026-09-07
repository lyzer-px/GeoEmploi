from typing import Optional, Any


from sqlalchemy.orm import Session
from sqlmodel import select
from fastapi import Depends, HTTPException

from app.db.models import User, Role
from app.schemas.input.user import UserUpdate, UserCreate
from app.db.database import get_db_session


class UserNotFoundError(Exception):
    pass


class UserAlreadyExistsError(Exception):
    pass


class UserService:
    def __init__(self, session: Session):
        self._db: Session = session

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        statement = select(User).where(User.id == user_id)
        return self._db.scalars(statement).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return self._db.scalars(statement).first()

    def get_all_users(self) -> list[User]:
        statement = select(User)
        return list(self._db.scalars(statement).all())

    def get_users_with_role(self, role_name: str) -> list[User]:
        statement = select(User).join(User.roles).where(Role.name == role_name)
        return list(self._db.scalars(statement).all())

    def get_roles_of_user(self, user: User) -> list[Role]:
        return user.roles

    def get_stringify_roles_of_user(self, user: User) -> list[str]:
        return [role.name for role in user.roles]

    def create_user(
        self,
        user_data: UserCreate,
        role: Optional[Role] = None,
    ) -> User:
        new_user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
        )

        new_user.set_password(user_data.password)
        if role:
            new_user.roles.append(role)
        self._db.add(new_user)
        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=409,
                detail="This user already exists.",
            )
        self._db.refresh(new_user)
        return new_user

    def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        user: Optional[User] = self.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        update_data: dict[str, Any] = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "password":
                user.set_password(value)
            else:
                setattr(user, field, value)
        try:
            self._db.commit()
            self._db.refresh(user)
            return user
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Email or constraint conflict upon updating user.",
            )

    def delete_user(self, user_id: int) -> None:
        user: Optional[User] = self.get_user_by_id(user_id)

        if not user:
            raise UserNotFoundError(f"User {user_id} not found")

        self._db.delete(user)
        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(status_code=404, detail="User not found")


def get_user_service(session: Session = Depends(get_db_session)) -> UserService:
    return UserService(session)
