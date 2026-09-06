from fastapi import HTTPException, status
from typing import Annotated
from fastapi import Depends

from app.db.models import UsersSkills, Skill
from app.core.permissions import Resource, Action
from app.api.dependencies.auth import require_ownership, CurrentUserDep
from app.services.skill_service import get_skill_service, SkillService

owner_name: str = "user_id"

SkillServiceDep = Annotated[SkillService, Depends(get_skill_service)]


def get_skill(skill_id: int, skill_service: SkillServiceDep) -> Skill:
    skill = skill_service.get_skill_by_id(skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found"
        )
    return skill


SkillDep = Annotated[Skill, Depends(get_skill)]


def get_user_skill(
    user_id: int, skill_id: int, skill_service: SkillServiceDep
) -> UsersSkills:
    entry = skill_service.get_user_skill(user_id, skill_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User skill association not found",
        )
    return entry


def get_my_skill(
    skill_id: int, user: CurrentUserDep, skill_service: SkillServiceDep
) -> UsersSkills:
    entry = skill_service.get_user_skill(user.id, skill_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill {skill_id} not found on your profile.",
        )
    return entry


MySkillDep = Annotated[UsersSkills, Depends(get_my_skill)]

UserSkillUpdateDep = Annotated[
    UsersSkills,
    Depends(
        require_ownership(Resource.SKILL, Action.UPDATE, owner_name, get_user_skill)
    ),
]
UserSkillDeleteDep = Annotated[
    UsersSkills,
    Depends(
        require_ownership(Resource.SKILL, Action.DELETE, owner_name, get_user_skill)
    ),
]
