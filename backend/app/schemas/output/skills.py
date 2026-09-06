from typing import Optional

from pydantic import BaseModel, ConfigDict

class SkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None


class SkillUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    skill_id: int
    level: int
