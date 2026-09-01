from pydantic import BaseModel


class Localisation(BaseModel):
    latitude: float
    longitude: float
