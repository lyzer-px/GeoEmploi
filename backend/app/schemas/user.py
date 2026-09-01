from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserIn(BaseModel):
    email: EmailStr
    password: str

class Localisation(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    timestamp: int

class JobOffer(BaseModel):
    title: str
    description: str
    recruiter_id: int
    localisation: Localisation