from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr

from app.schemas.output.user import UserOut
from app.schemas.output.offers import OfferOut


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class ApplicationOut(BaseModel):
    model_config = {"from_attributes": True}
    user: UserOut
    status: ApplicationStatus
    created_at: datetime
    resume_original_filename: str
    cover_letter_original_filename: str

class MyApplicationOut(BaseModel):
    model_config = {"from_attributes": True}

    application: ApplicationOut
    offer: OfferOut
