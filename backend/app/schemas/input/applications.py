from pydantic import BaseModel
from app.db.models.application import ApplicationStatus


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus
