
from fastapi import APIRouter
from pydantic import BaseModel

from app.db import db
from app.db.models import Offer
from app.schemas.offers import CreateOfferRequest

offers_router = APIRouter(tags=["offers"])

@offers_router.post("/offre")
async def create_offer(data: CreateOfferRequest):
    new_offer = Offer(
        name=data.name,
        description=data.description,
        status=data.status,
        employer_id=data.employer_id
    )
    db.add(new_offer)
    db.commit()
    return {"message": "Offer created successfully", "offer": new_offer}
