from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class OfferLocalisation(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
