from fastapi import APIRouter, status
from fastapi.security import OAuth2PasswordBearer

from app.api.dependencies import UserServiceDep, AccessTokenDep, CurrentUserDep
from app.schemas.user import UserUpdate
from app.db.models import User

users_router = APIRouter(tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@users_router.patch("/me", status_code=status.HTTP_200_OK)
def update_my_account(user: UserUpdate, user_service: UserServiceDep, token: AccessTokenDep):
    """Update user information"""
    user_service.update_user(token.user_id, user)


@users_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(token: AccessTokenDep, user_service: UserServiceDep):
    "Delete user account"
    user_service.delete_user(token.user_id)

@users_router.get("/me")
def get_my_account(token: AccessTokenDep, user: CurrentUserDep, user_service: UserServiceDep):
    """Retrieve information about a user"""
    

@users_router.get("/me/roles", status_code=status.HTTP_200_OK)
def get_my_roles(token: AccessTokenDep, user: CurrentUserDep, user_service: UserServiceDep):
    return user_service.get_stringify_roles_of_user(user)