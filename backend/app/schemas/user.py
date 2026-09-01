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
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class JobOffer(BaseModel):
    title: str
    description: str
    recruiter: str
