from fastapi import APIRouter, HTTPException

from app.schemas.offer import NearbyOfferOut, NearbyOffersQuery
from app.services.proximity.query import find_nearby_offers
from db.models import Offer
from job_offer import OfferCreate
from api.auth import db_dependency, user_dependency

router = APIRouter()


@router.post("/job_offers")
async def create_job_offer(
    data: OfferCreate,
    db: db_dependency,
    current_user: user_dependency,
):
    offer = Offer(
        name=data.name,
        description=data.description,
        status=data.status,
        employer_id=current_user.id,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


@router.delete("/job_offers/{offer_id}")
async def delete_job_offer(offer_id: int, db: db_dependency):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Job offer not found")
    db.delete(offer)
    db.commit()
    return {"message": "Job offer deleted successfully"}