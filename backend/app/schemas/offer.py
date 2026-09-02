from pydantic import BaseModel

from app.schemas.localisation import FixedLocalisation, PreciseLocalisation

from core.config import BASE_OFFER_DETECTION_RADIUS_M

class OfferCreate(BaseModel):
    localisation: FixedLocalisation

    model_config = {"from_attributes": True}

class NearbyOffersQuery(BaseModel):
    coordinates: PreciseLocalisation
    radius_m: int = BASE_OFFER_DETECTION_RADIUS_M

class NearbyOfferOut(BaseModel):
    id: int
    name: str
    description: str
    distance_m: int

    model_config = {"from_attributes": True}