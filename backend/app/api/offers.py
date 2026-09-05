import logging
from fastapi import APIRouter, Depends, status
from fastapi_pagination import set_params, set_page
from fastapi_pagination.cursor import CursorPage, CursorParams
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy.orm import Session
from sqlalchemy.sql import Select


from app.schemas.input.offers import OfferCreate, OfferUpdate
from app.schemas.output.offers import OfferOut
from app.db.database import get_db_session
from app.api.dependencies import require_permission, OfferServiceDep
from app.db.models import User, Offer
from app.services.geography import get_bounding_box, perimeter_to_radius, BoundingBox
from app.services.offer_service import OfferService

offers_router = APIRouter(tags=["offers"])

set_page(CursorPage[OfferOut])
set_params(CursorParams(size=10))


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

@offers_router.get(
    "/", status_code=status.HTTP_200_OK, response_model=CursorPage[OfferOut]
)
def get_offers_by_position(
    latitude: float,
    longitude: float,
    perimeter: float,
    session: Session = Depends(get_db_session),
):
    logging.info(f"Get offers by position: {latitude=}, {longitude=}")
    bounding_box: BoundingBox = get_bounding_box(latitude, longitude, perimeter_to_radius(perimeter))
    statement: Select = OfferService.get_offers_statement_by_location(bounding_box)
    return paginate(session, statement)