from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .offer import Offer
    from .rbac import User


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    # resume_path: Mapped[str] = mapped_column(String(256))
    # resume_original_filename: Mapped[str] = mapped_column(String(1024))
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="applications")
    offer_id: Mapped[int] = mapped_column(
        ForeignKey("offers.id", ondelete="CASCADE"), nullable=False
    )
    offer: Mapped["Offer"] = relationship(back_populates="applications")
