from datetime import date
from typing import Optional
from enum import Enum
from app.db.models import Offer

from pydantic import BaseModel

class ContractType(str, Enum):
    PART_TIME = "part-time"
    FULL_TIME = "full-time"
    INTERNSHIP = "internship"
    VOLUNTEER = "volunteer"


class OfferOut(BaseModel):
    id: int
    name: str
    description: str
    start_date: date
    end_date: Optional[date]
    contract_type: ContractType
    latitude: float
    longitude: float
    adress: str
    employer_first_name: str
    employer_last_name: str

    @classmethod
    def from_orm_model(cls, offer: Offer) -> "OfferOut":
        return cls(
            id=offer.id,
            name=offer.name,
            description=offer.description,
            start_date=offer.start_date,
            end_date=offer.end_date,
            contract_type=offer.contract_type,
            latitude=offer.latitude,
            longitude=offer.longitude,
            adress=offer.adress,
            employer_first_name=offer.employer.first_name,
            employer_last_name=offer.employer.last_name,
        )