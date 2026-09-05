from fastapi import APIRouter, status

from app.api.dependencies import RoleServiceDep, AccessTokenDep
from app.schemas.input.roles import PermissionCreate


permissions_router = APIRouter(tags=["Permissions"])


@permissions_router.post("/", status_code=status.HTTP_201_CREATED)
def create_permissions(
    permission: PermissionCreate, role_service: RoleServiceDep, _: AccessTokenDep
):
    role_service.create_permission(permission.name)

@permissions_router.get("/", status_code=status.HTTP_200_OK)
def get_permissions(
    role_service: RoleServiceDep,
    _: AccessTokenDep,
):
    return role_service.get_all_permissions()
