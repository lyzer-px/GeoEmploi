from fastapi import APIRouter, status, HTTPException

from app.api.dependencies.auth import RoleServiceDep, AccessTokenDep, UserServiceDep
from app.schemas.input.roles import RoleCreate
from app.schemas.output.roles import RoleOut
from app.schemas.input.user import UserRolesUpdate


roles_router = APIRouter(tags=["roles"])


@roles_router.post("/", status_code=status.HTTP_201_CREATED, response_model=RoleOut)
def create_role(role_data: RoleCreate, role_service: RoleServiceDep):
    return role_service.create_role(role_data)


@roles_router.get("/", status_code=status.HTTP_200_OK, response_model=list[RoleOut])
def get_roles(role_service: RoleServiceDep, _: AccessTokenDep):
    return role_service.get_all_roles()


@roles_router.patch(
    "/{role_id}", status_code=status.HTTP_200_OK, response_model=list[RoleOut]
)
def update_role(
    role_id: int,
    role_data: RoleCreate,
    role_service: RoleServiceDep,
    _: AccessTokenDep,
):
    return role_service.update_role(role_id, role_data)


@roles_router.patch("/{userId}", status_code=status.HTTP_200_OK)
def set_user_roles(
    userId: int,
    roles_data: UserRolesUpdate,
    user_service: UserServiceDep,
    role_service: RoleServiceDep,
):
    user = user_service.get_user_by_id(userId)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {userId} not found",
        )

    return role_service.set_user_roles(
        user,
        roles_data.roles,
    )
