from fastapi import APIRouter, status
import logging

from app.schemas.input.experiences import ExperienceCreate, ExperienceUpdate
from app.schemas.output.experiences import ExperienceOut
from app.api.dependencies.auth import CurrentUserDep
from app.api.dependencies.experiences import (
    ExperienceServiceDep,
    ExperienceUpdateDep,
    ExperienceDeleteDep,
)

experiences_router = APIRouter(tags=["experiences"])


@experiences_router.get(
    "/me",
    response_model=list[ExperienceOut],
    status_code=status.HTTP_200_OK,
)
def get_my_experiences(user: CurrentUserDep, experience_service: ExperienceServiceDep):
    return experience_service.get_experiences_by_user(user.id)


@experiences_router.get(
    "/{user_id}",
    response_model=list[ExperienceOut],
    status_code=status.HTTP_200_OK,
)
def get_user_experiences(user_id: int, experience_service: ExperienceServiceDep):
    return experience_service.get_experiences_by_user(user_id)


@experiences_router.post(
    "/me",
    response_model=ExperienceOut,
    status_code=status.HTTP_201_CREATED,
)
def create_experience(
    experience_data: ExperienceCreate,
    user: CurrentUserDep,
    experience_service: ExperienceServiceDep,
):
    """Create a new experiences for the current user."""
    logging.info(experience_data)
    return experience_service.create_experience(user, experience_data)


@experiences_router.patch(
    "/{experience_id}/me",
    response_model=ExperienceOut,
    status_code=status.HTTP_200_OK,
)
def update_experience(
    experience_data: ExperienceUpdate,
    experiences: ExperienceUpdateDep,
    experience_service: ExperienceServiceDep,
):
    return experience_service.update_experience(experiences, experience_data)


@experiences_router.delete(
    "/{experience_id}/me", status_code=status.HTTP_204_NO_CONTENT
)
def delete_experience(
    experiences: ExperienceDeleteDep,
    experience_service: ExperienceServiceDep,
):
    experience_service.delete_experience(experiences)
