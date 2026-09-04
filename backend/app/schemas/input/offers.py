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
    contract_type: list[ContractType]
    adress: str
    geocoding_source: str
    geocoding_score: float
    latitude: float
    longitude: float