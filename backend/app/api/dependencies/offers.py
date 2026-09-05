from fastapi import HTTPException, status
from typing import Annotated
from fastapi import Depends

from app.core.permissions import Resource, Action
from app.db.models import Offer
from app.services.offer_service import OfferService, get_offer_service
from app.api.dependencies.auth import require_ownership

OfferServiceDep = Annotated[OfferService, Depends(get_offer_service)]

owner_name: str = "employer_id"


def get_offer(offer_id: int, offer_service: OfferServiceDep) -> Offer:
    offer = offer_service.get_offer_by_id(offer_id)

    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Offer {offer_id} not found.",
        )
    return offer


OfferDeleteDep = Annotated[
    Offer,
    Depends(require_ownership(Resource.OFFER, Action.DELETE, owner_name, get_offer)),
]
OfferUpdateDep = Annotated[
    Offer,
    Depends(require_ownership(Resource.OFFER, Action.UPDATE, owner_name, get_offer)),
]
