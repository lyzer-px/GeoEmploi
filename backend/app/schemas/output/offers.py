from datetime import date
from typing import Optional
from enum import Enum

from pydantic import BaseModel, ConfigDict


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