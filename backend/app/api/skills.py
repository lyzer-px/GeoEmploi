from fastapi import APIRouter, status, Depends

from app.db.models import User
from app.schemas.input.skills import (
    SkillCreate,
    SkillUpdate,
)
from app.schemas.output.skills import SkillOut, SkillUserOut
from app.api.dependencies.auth import require_permission
from app.api.dependencies.skills import (
    SkillServiceDep,
    SkillDep,
    UserSkillDeleteDep,
    MySkillDep,
)
from app.api.dependencies.auth import CurrentUserDep
from app.schemas.input.skills import UserSkillCreate, UserSkillUpdate
from app.core.permissions import Action, Resource, perm

skills_router = APIRouter(tags=["skills"])


@skills_router.get(
    "/me", response_model=list[SkillUserOut], status_code=status.HTTP_200_OK
)
def get_my_skills(user: CurrentUserDep, skill_service: SkillServiceDep):
    return skill_service.get_user_skills(user.id)


@skills_router.post(
    "/me", response_model=SkillUserOut, status_code=status.HTTP_201_CREATED
)
def add_my_skill(
    skill_data: UserSkillCreate,
    user: CurrentUserDep,
    skill_service: SkillServiceDep,
):
    return skill_service.add_skill_to_user(user, skill_data)


@skills_router.patch(
    "/{skill_id}/me", response_model=SkillUserOut, status_code=status.HTTP_200_OK
)
def update_my_skill(
    skill_data: UserSkillUpdate,
    entry: MySkillDep,
    skill_service: SkillServiceDep,
):
    return skill_service.update_user_skill(entry, skill_data)


@skills_router.delete("/{skill_id}/me", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_skill(entry: MySkillDep, skill_service: SkillServiceDep):
    skill_service.remove_skill_from_user(entry)


@skills_router.post("/", status_code=status.HTTP_201_CREATED, response_model=SkillOut)
def create_skill(
    skill_data: SkillCreate,
    skill_service: SkillServiceDep,
    _: User = Depends(require_permission(perm(Action.CREATE, Resource.SKILL))),
):
    return skill_service.create_skill(skill_data)


@skills_router.get("/{skill_id}", response_model=SkillOut)
def get_skill_by_id(skill: SkillDep):
    return skill


@skills_router.get("/", response_model=list[SkillOut])
def list_skills(
    skill_service: SkillServiceDep,
    skip: int = 0,
    limit: int = 100,
):
    return skill_service.get_all_skills(skip=skip, limit=limit)


@skills_router.patch("/{skill_id}", response_model=SkillOut)
def update_skill(
    skill_data: SkillUpdate,
    skill: SkillDep,
    skill_service: SkillServiceDep,
    _: User = Depends(require_permission(perm(Action.UPDATE, Resource.SKILL))),
):
    return skill_service.update_skill(skill, skill_data)


@skills_router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill: SkillDep,
    skill_service: SkillServiceDep,
    _: User = Depends(require_permission(perm(Action.DELETE, Resource.SKILL))),
):
    skill_service.delete_skill(skill)


@skills_router.get("/users/{user_id}", response_model=list[SkillUserOut])
def get_user_skills(
    user_id: int,
    skill_service: SkillServiceDep,
):
    return skill_service.get_user_skills(user_id)


@skills_router.delete(
    "/users/{user_id}/{skill_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_skill_from_user(
    entry: UserSkillDeleteDep,
    skill_service: SkillServiceDep,
):
    skill_service.remove_skill_from_user(entry)
