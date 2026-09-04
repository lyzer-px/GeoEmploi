from fastapi import APIRouter


from app.api.dependencies import UserServiceDep, AccessToken
from app.schemas.input.offers import OfferCreate

offers_router = APIRouter(tags=["offers"])


#@offers_router.post("/")
#def create_offer():
#