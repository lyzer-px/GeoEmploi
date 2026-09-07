from pydantic import BaseModel, ConfigDict


class PermissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    description: str
    permissions: list[PermissionOut]
    is_self_assignable: bool
