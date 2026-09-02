from pydantic import BaseModel

class PreciseLocalisation(BaseModel):
    latitude: float
    longitude: float

class FixedLocalisation(BaseModel):
    country: str
    city: str
    address: str
    coordinates: PreciseLocalisation