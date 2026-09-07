from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    last_name: str
    email: EmailStr
    roles: Optional[list[RoleOut]] = []
