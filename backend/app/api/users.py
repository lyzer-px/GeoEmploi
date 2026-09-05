from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.api.dependencies.auth import (
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


@users_router.get("/me", status_code=status.HTTP_200_OK)
def get_my_account(user: CurrentUserDep):
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }


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


@users_router.patch("/{userId}", status_code=status.HTTP_200_OK)
def update_user(
    userId: int,
    user_update: UserUpdate,
    user_service: UserServiceDep,
):
    return user_service.update_user(userId, user_update)


@users_router.patch("/{userId}/roles", status_code=status.HTTP_200_OK)
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
