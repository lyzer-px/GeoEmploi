from datetime import date
from typing import Optional
from pydantic import BaseModel


class ExperienceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None


class ExperienceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
