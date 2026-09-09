from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.db.models.application import ApplicationStatus
from app.schemas.output.offers import OfferOut


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: EmailStr
    status: ApplicationStatus
    created_at: datetime
    resume_original_filename: str
    cover_letter_original_filename: str


class MyApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    application: ApplicationOut
    offer: OfferOut


class CreatorOfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    offer: OfferOut
    first_name: str
    last_name: str
    email: EmailStr
    applications: list[ApplicationOut]
