from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    SmallInteger,
    Date,
    DateTime,
    String,
    ForeignKey,
    Time,
    Enum as SQLEnum,
)

from enum import Enum
from datetime import date, time, datetime
from werkzeug.security import check_password_hash, generate_password_hash


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(256), nullable=False)
    last_name: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(256), nullable=False)
    roles: Mapped[list["Role"]] = relationship(
        secondary="user_roles", back_populates="users"
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

    def check_password(self, password: str):
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

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), primary_key=True)
    permission_id: Mapped[int] = mapped_column(
        ForeignKey("permissions.id"), primary_key=True
    )


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256), unique=True)
    level: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    description: Mapped[str | None] = mapped_column(String(256), nullable=True)
    users: Mapped[list["User"]] = relationship(
        secondary="users_skills", back_populates="skills"
    )


class UsersSkills(Base):
    __tablename__ = "users_skills"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    )


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="experiences")
    description: Mapped[str | None] = mapped_column(String(256), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)


class UserAvailability(Base):
    __tablename__ = "availabilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    day_of_week: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="availabilities")


class OfferAvailability(Base):
    __tablename__ = "offer_availabilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    offer_id: Mapped[int] = mapped_column(
        ForeignKey("offers.id", ondelete="CASCADE"), nullable=False
    )
    day_of_week: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    offer: Mapped["Offer"] = relationship(back_populates="required_availabilities")


class OfferStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(String(2056), nullable=False)
    status: Mapped[OfferStatus] = mapped_column(SQLEnum(OfferStatus), nullable=False)

    employer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    employer: Mapped["User"] = relationship(back_populates="offers_created")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now(), onupdate=datetime.now()
    )

    applications: Mapped[list["Application"]] = relationship(back_populates="offer")
    required_availabilities: Mapped[list["OfferAvailability"]] = relationship(
        back_populates="offer"
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="applications")
    offer_id: Mapped[int] = mapped_column(
        ForeignKey("offers.id", ondelete="CASCADE"), nullable=False
    )
    offer: Mapped["Offer"] = relationship(back_populates="applications")
