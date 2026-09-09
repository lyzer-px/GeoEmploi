from pydantic import BaseModel, ConfigDict


from app.schemas.output.user import UserOut
from app.schemas.output.skills import SkillUserOut
from app.schemas.output.experiences import ExperienceOut
from app.schemas.output.offers import OfferOut
from app.schemas.output.applications import ApplicationOut


class ExportOut(BaseModel):
    user: UserOut
    skills: list[SkillUserOut]
    experience: list[ExperienceOut]
    offers: list[OfferOut]
    application: list[ApplicationOut]
