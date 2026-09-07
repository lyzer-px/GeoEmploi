from fastapi import APIRouter, File, UploadFile, status, Depends
from fastapi.responses import FileResponse

from app.schemas.input.applications import ApplicationUpdate
from app.schemas.output.applications import MyApplicationOut
from app.api.dependencies.auth import CurrentUserDep
from app.api.dependencies.application import ApplicationServiceDep, ApplicationDeleteDep
from app.db.models import User
from app.api.dependencies.auth import require_permission, perm, Action, Resource
from app.services import application_service


applications_router = APIRouter(tags=["applications"])


@applications_router.get(
    "/me", response_model=list[MyApplicationOut], status_code=status.HTTP_200_OK
)
def get_my_applications(
    application_service: ApplicationServiceDep, user: CurrentUserDep
):
    return application_service.get_application_by_user(user)


@applications_router.get(
    "/{application_id}/resume",
    status_code=status.HTTP_200_OK,
    response_class=FileResponse,
)
def get_resume(
    application_id: int,
    application_service: ApplicationServiceDep,
):
    return application_service.get_resume_file(application_id)


@applications_router.get(
    "/{application_id}/cover_letter",
    status_code=status.HTTP_200_OK,
    response_class=FileResponse,
)
def get_cover_letter(
    application_id: int,
    application_service: ApplicationServiceDep,
):
    return application_service.get_cover_letter_file(application_id)


@applications_router.post(
    "/{offer_id}", status_code=status.HTTP_201_CREATED, response_model=MyApplicationOut
)
async def apply_to_offer(
    offer_id: int,
    application_service: ApplicationServiceDep,
    resume: UploadFile = File(...),
    cover_letter: UploadFile = File(...),
    user: User = Depends(require_permission(perm(Action.CREATE, Resource.APPLICATION))),
):
    return application_service.save_application(offer_id, user, resume, cover_letter)


@applications_router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_service: ApplicationServiceDep, application: ApplicationDeleteDep
):
    application_service.delete_application(application)


@applications_router.patch("/{application_id}", status_code=status.HTTP_200_OK, response_model= MyApplicationOut)
def update_status_application(
    application_status: ApplicationUpdate, application_service: ApplicationServiceDep
):
    application_service.update_status_application(application_status)
