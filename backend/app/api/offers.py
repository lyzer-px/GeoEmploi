from fastapi import APIRouter, Depends, status
from typing import Sequence

from app.api.dependencies import require_permission, OfferServiceDep
from app.schemas.input.offers import OfferCreate, OfferUpdate
from app.schemas.output.offers import OfferOut
from app.db.models import User, Offer

offers_router = APIRouter(tags=["offers"])


@offers_router.post("/", status_code=status.HTTP_201_CREATED)
def create_offer(
    offer_data: OfferCreate,
    offer_service: OfferServiceDep,
    user: User = Depends(require_permission("create:offer")),
):
    offer_service.create_offer(offer_data, user)


@offers_router.patch("/{offerId}", status_code=status.HTTP_200_OK)
def update_offer(
    offerId: int,
    offer_update: OfferUpdate,
    offer_service: OfferServiceDep,
    _: User = Depends(require_permission("update:offer")),
):
    offer_service.update_offer(offerId, offer_update)


@offers_router.get("/", status_code=status.HTTP_200_OK)
def get_all_offers(offer_service: OfferServiceDep):
    offers: list[Offer] = offer_service.get_all_offers()
    offers_out: list[OfferOut] = []

    for offer in offers:
        offers_out.append(OfferOut.from_orm_model(offer))
    return offers_out