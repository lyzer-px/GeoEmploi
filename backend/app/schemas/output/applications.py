from pydantic import BaseModel, ConfigDict
from app.schemas.output.offers import OfferOut


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    offer: OfferOut

    resume_original_filename: str