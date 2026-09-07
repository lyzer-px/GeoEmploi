from fastapi import APIRouter, status
from fastapi.security import OAuth2PasswordBearer

from app.schemas.input.user import UserUpdate
from app.schemas.output.auth import UserOut
from app.api.dependencies.auth import (
    UserServiceDep,
    AccessTokenDep,
    CurrentUserDep,
)

users_router = APIRouter(tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

#
#   USER Account
#


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


@users_router.get("/me", response_model=UserOut, status_code=status.HTTP_200_OK)
def get_my_account(user: CurrentUserDep, user_service: UserServiceDep):
    """Get user information"""
    return UserOut.model_validate(user)


#
#   OTHER ACCOUNT
#


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
