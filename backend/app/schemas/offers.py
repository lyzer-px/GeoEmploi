from pydantic import BaseModel


class JobOffer(BaseModel):
    title: str
    description: str
    recruiter: str
