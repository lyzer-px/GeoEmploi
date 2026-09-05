from pydantic import BaseModel


class RoleCreate(BaseModel):
    name: str
    description: str
    permissions: list[str]
    is_self_assignable: bool
