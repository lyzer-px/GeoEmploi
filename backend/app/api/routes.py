from fastapi import APIRouter, Depends
from typing import Annotated
from fastapi import APIRouter
from app.schemas.user import UserCreate, UserIn, Localisation
from starlette import status
from auth import db_dependency, bcrypt_context

router: APIRouter = APIRouter()

@router.get("/health")
def get_health():
    return {"status": "ok"}

@router.get("/")
async def root():
    return {
        "title": "GeoEmploi",
        "description": "New Linkedin",
        "version": "0.1.0",
    }

@router.post("/api/localisation")
async def save_user_location(local: Localisation):
    return {
        "message": "Localisation received",
        "latitude": local.latitude,
        "longitude": local.longitude
    }
