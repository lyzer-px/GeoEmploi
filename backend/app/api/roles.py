from fastapi import APIRouter, status

from app.api.dependencies import RoleServiceDep, AccessTokenDep
from app.schemas.input.roles import RoleCreate


roles_router = APIRouter(tags=["roles"])


@roles_router.post("/", status_code=status.HTTP_201_CREATED)
def create_role(role_data: RoleCreate, role_service: RoleServiceDep):
    role_service.create_role(role_data)


@roles_router.get("/", status_code=status.HTTP_200_OK)
def get_roles(role_service: RoleServiceDep, _: AccessTokenDep):
    return role_service.get_all_roles()
