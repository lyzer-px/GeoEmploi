from datetime import date
from enum import Enum

from pydantic import BaseModel, EmailStr

from app.schemas.output.offers import OfferOut


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class ApplicationOut(BaseModel):
    model_config = {"from_attributes": True}

    first_name: str
    last_name: str
    email: EmailStr
    status: ApplicationStatus
    created_at: date
    resume_original_filename: str
    resume_path: str


class MyApplicationOut(BaseModel):
    application: ApplicationOut
    offer: OfferOut
