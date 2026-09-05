from fastapi import APIRouter, status

from app.api.dependencies.auth import RoleServiceDep, AccessTokenDep
from app.schemas.output.roles import PermissionOut

permissions_router = APIRouter(tags=["Permissions"])


@permissions_router.get(
    "/", status_code=status.HTTP_200_OK, response_model=list[PermissionOut]
)
def get_permissions(
    role_service: RoleServiceDep,
    _: AccessTokenDep,
):
    return role_service.get_all_permissions()
