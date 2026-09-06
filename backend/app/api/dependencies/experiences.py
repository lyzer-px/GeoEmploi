from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.core.permissions import Resource, Action
from app.db.models import Experience
from app.services.experience_service import ExperienceService, get_experience_service
from app.api.dependencies.auth import require_ownership

ExperienceServiceDep = Annotated[ExperienceService, Depends(get_experience_service)]

owner_name: str = "user_id"


def get_experience(
    experience_id: int, experience_service: ExperienceServiceDep
) -> Experience:
    experience = experience_service.get_experience_by_id(experience_id)

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experience {experience_id} not found.",
        )
    return experience


ExperienceDeleteDep = Annotated[
    Experience,
    Depends(
        require_ownership(
            Resource.EXPERIENCE, Action.DELETE, owner_name, get_experience
        )
    ),
]
ExperienceUpdateDep = Annotated[
    Experience,
    Depends(
        require_ownership(
            Resource.EXPERIENCE, Action.UPDATE, owner_name, get_experience
        )
    ),
]
