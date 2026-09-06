from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.api.dependencies.skills import SkillServiceDep, MySkillDep
from app.schemas.input.skills import UserSkillCreate, UserSkillUpdate
from app.schemas.output.skills import SkillUserOut
from app.schemas.input.user import UserUpdate, UserRolesUpdate
from app.api.dependencies.auth import (
    UserServiceDep,
    AccessTokenDep,
    CurrentUserDep,
    RoleServiceDep,
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


@users_router.get("/me", status_code=status.HTTP_200_OK)
def get_my_account(user: CurrentUserDep):
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }


# Roles


@users_router.get("/me/roles", status_code=status.HTTP_200_OK)
def get_my_roles(_: AccessTokenDep, user: CurrentUserDep, user_service: UserServiceDep):
    return user_service.get_stringify_roles_of_user(user)


@users_router.patch("/me/roles", status_code=status.HTTP_200_OK)
def set_my_roles(
    roles_data: UserRolesUpdate, user: CurrentUserDep, role_service: RoleServiceDep
):
    for role in roles_data.roles:
        role_service.assign_self_assignable_role_to_user(user, role)


# Skills


@users_router.get(
    "/me/skills", response_model=list[SkillUserOut], status_code=status.HTTP_200_OK
)
def get_my_skills(user: CurrentUserDep, skill_service: SkillServiceDep):
    return skill_service.get_user_skills(user.id)


@users_router.post(
    "/me/skills",
    response_model=SkillUserOut,
    status_code=status.HTTP_201_CREATED,
)
def add_my_skill(
    skill_data: UserSkillCreate,
    user: CurrentUserDep,
    skill_service: SkillServiceDep,
):
    return skill_service.add_skill_to_user(user, skill_data)


@users_router.patch(
    "/me/skills/{skill_id}", response_model=SkillUserOut, status_code=status.HTTP_200_OK
)
def update_my_skill(
    skill_data: UserSkillUpdate,
    entry: MySkillDep,
    skill_service: SkillServiceDep,
):
    return skill_service.update_user_skill(entry, skill_data)


@users_router.delete("/me/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_skill(
    entry: MySkillDep,
    skill_service: SkillServiceDep,
):
    skill_service.remove_skill_from_user(entry)


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
