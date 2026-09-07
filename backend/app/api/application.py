from fastapi import APIRouter, File, UploadFile, status, Depends

from app.api.dependencies.offers import OfferServiceDep
from app.api.dependencies.application import ApplicationServiceDep, ApplicationDeleteDep
from app.schemas.output.offers import OfferOut
from app.schemas.input.application import ApplicationIn
from app.db.models import User
from app.api.dependencies.auth import require_permission, perm, Action, Resource
from app.services import application_service


applications_router = APIRouter(tags=["applications"])


@applications_router.get(
    "/me",
    response_model=list[OfferOut],
    status_code=status.HTTP_200_OK,
)
def get_my_applications(
    offer_service: OfferServiceDep,
):
    return offer_service


@applications_router.post("/{offer_id}")
def apply_to_offer(offer_id: int,  resume: UploadFile = File(...), cover_letter: UploadFile = File(...),
    application_service: ApplicationServiceDep = Depends(),
    user: User = Depends(require_permission(perm(Action.CREATE, Resource.APPLICATION)))
):
    application = ApplicationIn(resume=resume, cover_letter=cover_letter)

    return application_service.save_application(
        offer_id,
        user,
        application,
    )


@applications_router.delete("/{application_id}")
def delete_offer(
    application_service: ApplicationServiceDep, application: ApplicationDeleteDep
):
    application_service.delete_application(application)
