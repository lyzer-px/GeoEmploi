from datetime import date
from typing import Optional
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr
from app.db.models.application import ApplicationStatus


class ContractType(str, Enum):
    PART_TIME = "part-time"
    FULL_TIME = "full-time"
    INTERNSHIP = "internship"
    VOLUNTEER = "volunteer"


class EmployerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    last_name: str


class OfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    start_date: date
    end_date: Optional[date]
    contract_type: ContractType
    latitude: float
    longitude: float
    adress: str
    employer: EmployerOut


class ApplicationOut(BaseModel):
    model_config = {"from_attributes": True}

    first_name: str
    last_name: str
    email: EmailStr
    status: ApplicationStatus
    created_at: date
    resume_original_filename: str
    resume_path: str


class CreatorOfferOut(BaseModel):
    offer: OfferOut
    first_name: str
    last_name: str
    email: EmailStr
    applications: list[ApplicationOut]
