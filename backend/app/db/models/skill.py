from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .rbac import User


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256), unique=True)
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
    level: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    skill: Mapped["Skill"] = relationship(viewonly=True)

class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="experiences")
    description: Mapped[str | None] = mapped_column(String(256), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
