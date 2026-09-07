from datetime import datetime, timezone
from typing import TYPE_CHECKING
from enum import Enum

from sqlalchemy import ForeignKey, String, Enum as SQLEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .offer import Offer
    from .rbac import User


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)

    resume_path: Mapped[str] = mapped_column(String(1024))
    resume_original_filename: Mapped[str] = mapped_column(String(1024))

    cover_letter_path: Mapped[str] = mapped_column(String(1024))
    cover_letter_original_filename: Mapped[str] = mapped_column(String(1024))

    status: Mapped[ApplicationStatus] = mapped_column(
        SQLEnum(ApplicationStatus),
        nullable=False,
        default=ApplicationStatus.PENDING,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="applications")

    offer_id: Mapped[int] = mapped_column(
        ForeignKey("offers.id", ondelete="CASCADE"),
        nullable=False,
    )
    offer: Mapped["Offer"] = relationship(back_populates="applications")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
