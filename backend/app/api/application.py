from fastapi import APIRouter, status, Depends

from app.api.dependencies.offers import OfferServiceDep
from app.api.dependencies.application import ApplicationServiceDep, ApplicationDeleteDep
from app.schemas.output.offers import OfferOut
from app.schemas.input.application import ApplicationIn
from app.db.models import User
from app.api.dependencies.auth import require_permission, perm, Action, Resource


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
def apply_to_offer(
    offer_id: int,
    application_data: ApplicationIn,
    application_service: ApplicationServiceDep,
    user: User = Depends(require_permission(perm(Action.CREATE, Resource.OFFER))),
):
    return application_service.save_application(offer_id, user, application_data)


@applications_router.delete("/{application_id}")
def delete_offer(
    application_service: ApplicationServiceDep, application: ApplicationDeleteDep
):
    application_service.delete_application(application)
