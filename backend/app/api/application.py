from fastapi import APIRouter, status

from app.api.dependencies.auth import CurrentUserDep
from app.api.dependencies.offers import OfferServiceDep
from app.schemas.output.offers import OfferOut

applications_router = APIRouter(tags=["applications"])


@applications_router.get(
    "/me/applications",
    response_model=list[OfferOut],
    status_code=status.HTTP_200_OK,
)
def get_my_applications(
    user: CurrentUserDep,
    offer_service: OfferServiceDep,
):
    return offer_service
    return offer_service.get_offers_applied_to(user.id)