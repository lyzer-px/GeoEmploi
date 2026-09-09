from fastapi import APIRouter, status, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse


from app.api.dependencies.experiences import ExperienceServiceDep
from app.api.dependencies.application import ApplicationServiceDep
from app.api.dependencies.offers import OfferServiceDep
from app.api.dependencies.skills import SkillServiceDep
from app.schemas.input.user import UserUpdate
from app.schemas.output.user import UserOut
from app.schemas.output.export import ExportOut
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


@users_router.get(
    "/me/export", status_code=status.HTTP_200_OK, response_model=ExportOut
)
def export_my_data(
    user: CurrentUserDep,
    skill_service: SkillServiceDep,
    experience_service: ExperienceServiceDep,
):
    return ExportOut(
        user=user,
        skills=skill_service.get_user_skills(user.id),
        experience=experience_service.get_experiences_by_user(user.id),
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
