from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, field_serializer


class AccessToken(BaseModel):
    user_id: int
    email: EmailStr
    role: list[str]
    token_type: Literal["access"] = "access"
    exp: datetime

    @field_serializer("exp")
    def serialize_exp(self, exp: datetime, _info) -> int:
        return int(exp.timestamp())


class RefreshToken(BaseModel):
    user_id: int
    token_type: Literal["refresh"] = "refresh"
    exp: datetime

    @field_serializer("exp")
    def serialize_exp(self, exp: datetime, _info) -> int:
        return int(exp.timestamp())


class RefreshTokenRequest(BaseModel):
    refresh_token: str
