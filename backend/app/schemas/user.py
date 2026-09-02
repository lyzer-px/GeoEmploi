from pydantic import BaseModel, EmailStr

from app.schemas.localisation import FixedLocalisation

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    base_localisation: FixedLocalisation

class UserIn(BaseModel):
    email: EmailStr
    password: str

