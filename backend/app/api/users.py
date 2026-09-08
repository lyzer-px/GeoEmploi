from fastapi import APIRouter, status, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse

from app.schemas.input.user import UserUpdate
from app.schemas.output.user import UserOut
from app.db.models import User
from app.api.dependencies.auth import require_permission, perm, Action, Resource

from app.api.dependencies.auth import (
    UserServiceDep,
    AccessTokenDep,
    CurrentUserDep,
)
from app.core.permissions import Action, perm, perm
from app.core.permissions import Resource

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


@users_router.get("/me", status_code=status.HTTP_200_OK, response_model=UserOut)
def get_my_account(user: CurrentUserDep, user_service: UserServiceDep):
    """Get user information"""
    return user_service.get_user_by_id(user.id)

@users_router.get("/me/export", status_code=status.HTTP_200_OK)
def export_my_data(user: CurrentUserDep):
    return JSONResponse(
        content={
            "account": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "roles": [role.name for role in user.roles],
            },
            "skills": [
                {
                    "id": skill.skill.id,
                    "name": skill.skill.name,
                    "level": skill.level,
                }
                for skill in user.skills
            ],
            "experiences": [
                {
                    "id": experience.id,
                    "name": experience.name,
                    "description": experience.description,
                    "start_date": experience.start_date.isoformat(),
                    "end_date": (
                        experience.end_date.isoformat()
                        if experience.end_date
                        else None
                    ),
                }
                for experience in user.experiences
            ],
        }
    )


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


@users_router.get(
    "/",
    response_model=list[UserOut],
    status_code=status.HTTP_200_OK,
)
def get_all_users(user_service: UserServiceDep, _: CurrentUserDep):
    return user_service.get_all_users()
