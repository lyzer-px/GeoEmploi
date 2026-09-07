from datetime import date, datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .application import Application
    from .rbac import User


class ContractType(str, Enum):
    PART_TIME = "part-time"
    FULL_TIME = "full-time"
    INTERNSHIP = "internship"
    VOLUNTEER = "volunteer"


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    contract_type: Mapped[ContractType] = mapped_column(
        SQLEnum(ContractType),
        nullable=False,
    )
    employer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    employer: Mapped["User"] = relationship(back_populates="offers_created")

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    adress: Mapped[str] = mapped_column(String(1024), nullable=True)
    geocoding_source: Mapped[str] = mapped_column(Text)
    geocoding_score: Mapped[float] = mapped_column(nullable=True)
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)
    applications: Mapped[list["Application"]] = relationship(back_populates="offer", cascade="all, delete-orphan",)
