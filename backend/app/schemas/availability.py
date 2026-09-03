from pydantic import BaseModel


class AvailabilityCreate(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    start_date: str
    end_date: str
