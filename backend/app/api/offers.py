from typing import Optional

from fastapi import APIRouter, Depends, status
from fastapi_pagination import set_params, set_page
from fastapi_pagination.cursor import CursorPage, CursorParams
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy.orm import Session
from sqlalchemy.sql import Select


from app.api.dependencies.auth import CurrentUserDep
from app.api.dependencies.offers import OfferDeleteDep, OfferUpdateDep, OfferServiceDep
from app.core.permissions import perm, Action, Resource
from app.schemas.input.offers import OfferCreate, OfferUpdate
from app.schemas.output.offers import OfferOut, CreatorOfferOut
from app.db.database import get_db_session
from app.api.dependencies.auth import require_permission, require_ownership
from app.db.models import User
from app.services.geography import get_bounding_box, perimeter_to_radius, BoundingBox
from app.services.offer_service import OfferService

offers_router = APIRouter(tags=["offers"])

set_page(CursorPage[OfferOut])
set_params(CursorParams(size=10))


@offers_router.post("/", status_code=status.HTTP_201_CREATED, response_model=OfferOut)
def create_offer(
    offer_data: OfferCreate,
    offer_service: OfferServiceDep,
    user: User = Depends(require_permission(perm(Action.CREATE, Resource.OFFER))),
):
    return offer_service.create_offer(offer_data, user)


@offers_router.patch(
    "/{offer_id}", status_code=status.HTTP_200_OK, response_model=OfferOut
)
def update_offer(
    offer_data: OfferUpdate, offer: OfferUpdateDep, offer_service: OfferServiceDep
):
    return offer_service.update_offer(offer, offer_data)


@offers_router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer(
    offer: OfferDeleteDep,
    offer_service: OfferServiceDep,
):
    offer_service.delete_offer(offer)


@offers_router.get("/me", status_code=status.HTTP_200_OK, response_model=list[OfferOut])
def get_created_offers(offer_service: OfferServiceDep, user: CurrentUserDep):
    return offer_service.get_offers_by_employer(user.id)


@offers_router.get(
    "/me/{offer_id}",
    status_code=status.HTTP_200_OK,
    response_model=CreatorOfferOut,
)
def get_application_by_offer(offer_id: int, offer_service: OfferServiceDep):
    offer = offer_service.get_offer_by_id(offer_id)
    return {
        "offer": offer,
        "first_name": offer.employer.first_name,
        "last_name": offer.employer.last_name,
        "email": offer.employer.email,
        "applications": offer.applications,
    }

@offers_router.get(
    "/{offer_id}", status_code=status.HTTP_200_OK, response_model=OfferOut
)
def get_offers_by_id(offer_id: int, offer_service: OfferServiceDep):
    return offer_service.get_offer_by_id(offer_id)


@offers_router.get(
    "/", status_code=status.HTTP_200_OK, response_model=CursorPage[OfferOut]
)
def get_offers_by_position(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    perimeter: Optional[float] = None,
    name: Optional[str] = None,
    session: Session = Depends(get_db_session),
):
    statement = OfferService.get_offer_statement()

    if latitude and longitude and perimeter:
        bounding_box: BoundingBox = get_bounding_box(
            latitude, longitude, perimeter_to_radius(perimeter)
        )
        statement: Select = OfferService.filter_by_location(statement, bounding_box)
    if name:
        statement = OfferService.filter_by_name(statement, name)
    return paginate(session, statement)
