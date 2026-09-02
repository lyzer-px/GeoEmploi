from pydantic import BaseModel

from app.schemas.localisation import FixedLocalisation, PreciseLocalisation

class OfferCreate(BaseModel):
    localisation: FixedLocalisation

    model_config = {"from_attributes": True}

class NearbyOffersQuery(BaseModel):
    coordinates: PreciseLocalisation
    radius_m: int = 300

class NearbyOfferOut(BaseModel):
    id: int
    name: str
    description: str
    distance_m: int

    model_config = {"from_attributes": True}