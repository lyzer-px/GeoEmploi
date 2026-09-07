from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ExperienceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
