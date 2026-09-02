from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import check_password_hash, generate_password_hash

from .base import Base

if TYPE_CHECKING:
    from .application import Application
    from .availability import UserAvailability
    from .offer import Offer
    from .skill import Experience, Skill


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(256), nullable=False)
    last_name: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(256), nullable=False)
    roles: Mapped[list["Role"]] = relationship(
        secondary="user_roles", back_populates="users",
    )
    skills: Mapped[list["Skill"]] = relationship(
        secondary="users_skills", back_populates="users"
    )
    applications: Mapped[list["Application"]] = relationship(back_populates="user")
    offers_created: Mapped[list["Offer"]] = relationship(back_populates="employer")
    experiences: Mapped[list["Experience"]] = relationship(back_populates="user")
    availabilities: Mapped[list["UserAvailability"]] = relationship(
        back_populates="user"
    )

    def set_password(self, password: str):
        self.password = generate_password_hash(password)

    def verify_password(self, password: str):
        return check_password_hash(self.password, password)


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(256), unique=True)
    description: Mapped[str] = mapped_column(String(256))
    users: Mapped[list["User"]] = relationship(
        secondary="user_roles", back_populates="roles"
    )
    permissions: Mapped[list["Permission"]] = relationship(
        secondary="role_permissions", back_populates="roles"
    )


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(256), unique=True)
    roles: Mapped[list["Role"]] = relationship(
        secondary="role_permissions", back_populates="permissions"
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )

    permission_id: Mapped[int] = mapped_column(
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    )
