from pydantic import BaseModel
from typing import Optional


class SkillCreate(BaseModel):
    name: str
    description: Optional[str]


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class UserSkillCreate(BaseModel):
    name: str
    description: Optional[str] = None
    level: int


class UserSkillUpdate(BaseModel):
    level: Optional[int] = None
