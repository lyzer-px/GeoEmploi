from enum import Enum
from datetime import date
from typing import Optional

from pydantic import BaseModel


class ContractType(str, Enum):
    PART_TIME = "part-time"
    FULL_TIME = "full-time"
    INTERNSHIP = "internship"
    VOLUNTEER = "volunteer"


class OfferCreate(BaseModel):
    name: str
    description: str
    start_date: date
    end_date: Optional[date]
    contract_type: ContractType
    adress: str
    geocoding_source: str
    geocoding_score: float
    latitude: float
    longitude: float


class OfferUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    contract_type: Optional[ContractType]
    adress: Optional[str]
    geocoding_source: Optional[str]
    geocoding_score: Optional[float]
    latitude: Optional[float]
    longitude: Optional[float]
