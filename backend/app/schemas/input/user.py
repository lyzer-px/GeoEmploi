from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: Optional[str] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserIn(BaseModel):
    email: EmailStr
    password: str


class UserRolesUpdate(BaseModel):
    roles: list[str]


class UserAdminResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
