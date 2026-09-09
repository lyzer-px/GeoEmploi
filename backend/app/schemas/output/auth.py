from pydantic import BaseModel, ConfigDict, field_validator


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    roles: list[str]

    model_config = ConfigDict(from_attributes=True)

    @field_validator("roles", mode="before")
    @classmethod
    def extract_role_names(cls, roles):
        return [role.name for role in roles]


class RegisterResponse(BaseModel):
    user: UserOut
    tokens: Token
