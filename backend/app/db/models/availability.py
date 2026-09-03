from datetime import time
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum as SQLEnum, ForeignKey, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .offer import Offer
    from .rbac import User


class Weekday(Enum):
    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7


class Availability(Base):
    __tablename__ = "availabilities"

    id: Mapped[int] = mapped_column(primary_key=True)

    days: Mapped[list["AvailabilityDay"]] = relationship(
        back_populates="availability",
        cascade="all, delete-orphan",
    )


class AvailabilityDay(Base):
    __tablename__ = "availability_days"

    id: Mapped[int] = mapped_column(primary_key=True)

    day: Mapped[Weekday] = mapped_column(
        SQLEnum(Weekday),
        nullable=False,
    )
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    availability_id: Mapped[int] = mapped_column(
        ForeignKey("availabilities.id", ondelete="CASCADE"),
        nullable=False,
    )
    availability: Mapped["Availability"] = relationship(back_populates="days")


class UserAvailability(Base):
    __tablename__ = "user_availabilities"

    availability_id: Mapped[int] = mapped_column(
        ForeignKey("availabilities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    start_date: Mapped[Date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Date] = mapped_column(Date, nullable=False)

    availability: Mapped["Availability"] = relationship()

    user: Mapped["User"] = relationship(back_populates="availabilities")


class OfferAvailability(Base):
    __tablename__ = "offer_availabilities"

    availability_id: Mapped[int] = mapped_column(
        ForeignKey("availabilities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    offer_id: Mapped[int] = mapped_column(
        ForeignKey("offers.id", ondelete="CASCADE"),
        nullable=False,
    )

    availability: Mapped["Availability"] = relationship()
    offer: Mapped["Offer"] = relationship(back_populates="required_availabilities")
