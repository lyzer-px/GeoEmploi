from fastapi import APIRouter, status
from fastapi.security import OAuth2PasswordBearer

from app.api.dependencies import (
    UserServiceDep,
    AccessTokenDep,
    CurrentUserDep,
    RoleServiceDep,
)
from app.schemas.input.user import UserAdminResponse, UserUpdate, UserRolesUpdate

users_router = APIRouter(tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@users_router.patch("/me", status_code=status.HTTP_200_OK)
def update_my_account(
    user: UserUpdate, user_service: UserServiceDep, token: AccessTokenDep
):
    """Update user information"""
    user_service.update_user(token.user_id, user)


@users_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(token: AccessTokenDep, user_service: UserServiceDep):
    "Delete user account"
    user_service.delete_user(token.user_id)


@users_router.get("/me")
def get_my_account(user: CurrentUserDep, user_service: UserServiceDep):
    """Retrieve information about a user"""


@users_router.get("/me/roles", status_code=status.HTTP_200_OK)
def get_my_roles(
    token: AccessTokenDep, user: CurrentUserDep, user_service: UserServiceDep
):
    return user_service.get_stringify_roles_of_user(user)


@users_router.patch("/me/roles", status_code=status.HTTP_200_OK)
def set_my_roles(
    roles_data: UserRolesUpdate, user: CurrentUserDep, role_service: RoleServiceDep
):
    for role in roles_data.roles:
        role_service.assign_self_assignable_role_to_user(user, role)


@users_router.get(
    "/",
    response_model=list[UserAdminResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_users(user_service: UserServiceDep):
    return user_service.get_all_users()

@users_router.delete("/{userId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(userId: int, user_service: UserServiceDep):
    user_service.delete_user(userId)