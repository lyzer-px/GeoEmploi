from datetime import datetime, timezone
from typing import Any, Optional, Sequence
from fastapi import Depends, HTTPException, status
from pyproj import Transformer
from sqlalchemy.orm import Session
from sqlmodel import select

from app.db.database import get_db_session
from app.db.models import Application, Offer, User
from app.schemas.input.offers import OfferCreate, OfferUpdate


class OfferNotFoundError(Exception):
    pass


class OfferService:
    def __init__(self, session: Session):
        self._db: Session = session
        self._transformer = Transformer.from_crs(
            "EPSG:4326", "EPSG:2154", always_xy=True
        )

    def get_offer_by_id(self, offer_id: int) -> Optional[Offer]:
        """Retrieves an offer by its ID."""
        statement = select(Offer).where(Offer.id == offer_id)
        return self._db.scalars(statement).first()

    def get_all_offers(self, skip: int = 0, limit: int = 100) -> Sequence[Offer]:
        """Retrieves all offers with pagination."""
        statement = select(Offer).offset(skip).limit(limit)
        return self._db.scalars(statement).all()

    def get_offers_by_employer(self, employer_id: int) -> Sequence[Offer]:
        """Retrieves all offers created by a specific employer."""
        statement = select(Offer).where(Offer.employer_id == employer_id)
        return self._db.scalars(statement).all()

    def create_offer(self, offer_data: OfferCreate, employer: User) -> Offer:
        """Create a new offer by associating the geocoding metadata and the employer."""
        new_offer = Offer(
            name=offer_data.name,
            description=offer_data.description,
            start_date=offer_data.start_date,
            end_date=offer_data.end_date,
            contract_type=offer_data.contract_type,
            employer_id=employer.id,
            adress=offer_data.adress,
            latitude=offer_data.latitude,
            longitude=offer_data.longitude,
            geocoding_source=offer_data.geocoding_source,
            geocoding_score=offer_data.geocoding_score,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        self._db.add(new_offer)
        try:
            self._db.commit()
            self._db.refresh(new_offer)
            return new_offer
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during the creation of the offer.",
            )

    def update_offer(self, offer_id: int, offer_data: OfferUpdate) -> Offer:
        """Updates an existing offer."""
        offer = self.get_offer_by_id(offer_id)

        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Offer {offer_id} not found.",
            )
        update_dict: dict[str, Any] = offer_data.model_dump(exclude_unset=True)
        if "address" in update_dict:
            update_dict["adress"] = update_dict.pop("address")
        for field, value in update_dict.items():
            setattr(offer, field, value)
        offer.updated_at = datetime.now(timezone.utc)
        try:
            self._db.commit()
            self._db.refresh(offer)
            return offer
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating the offer.",
            )

    def delete_offer(self, offer_id: int) -> None:
        """Delete an offer"""
        offer = self.get_offer_by_id(offer_id)
        if not offer:
            raise OfferNotFoundError(f"Offer {offer_id} not found.")

        self._db.delete(offer)
        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting the offer",
            )

    def get_coordinates_lambert93(self, offer_id: int) -> dict[str, float]:
        """
        Retrieves the coordinates of an offer and converts them from WGS84 (EPSG:4326)
        to Lambert-93 (EPSG:2154) for administrative export purposes.
        """
        offer = self.get_offer_by_id(offer_id)
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Offer {offer_id} not found.",
            )

        x_lambert, y_lambert = self._transformer.transform(
            offer.longitude, offer.latitude
        )

        return {
            "x": round(x_lambert, 2),
            "y": round(y_lambert, 2),
        }

    def get_offer_applications(self, offer_id: int) -> list[Application]:
        """Retrieve all applications associated with a job posting."""
        offer = self.get_offer_by_id(offer_id)
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Offer {offer_id} not found.",
            )
        return offer.applications


def get_offer_service(session: Session = Depends(get_db_session)) -> OfferService:
    return OfferService(session)
