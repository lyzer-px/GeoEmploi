from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


class AccessToken(BaseModel):
    user_id: int
    email: EmailStr
    role: list[str]
    token_type: Literal["access"] = "access"
    exp: datetime


class RefreshToken(BaseModel):
    user_id: int
    token_type: Literal["refresh"] = "refresh"
    exp: datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"