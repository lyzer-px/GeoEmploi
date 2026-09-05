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
    end_date: Optional[date] = None
    contract_type: ContractType
    adress: str
    geocoding_source: str
    geocoding_score: float
    latitude: float
    longitude: float

class OfferUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    contract_type: Optional[ContractType] = None
    adress: Optional[str] = None
    geocoding_source: Optional[str] = None
    geocoding_score: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None