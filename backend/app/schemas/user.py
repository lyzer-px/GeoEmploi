from pydantic import BaseModel, EmailStr

from app.schemas.localisation import FixedLocalisation

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    base_localisation: FixedLocalisation

class UserIn(BaseModel):
    email: EmailStr
    password: str

class OfferCreate(BaseModel):
    id: int
    city: str
    country: str
    address: str
    localisation: FixedLocalisation

    model_config = {"from_attributes": True} 
