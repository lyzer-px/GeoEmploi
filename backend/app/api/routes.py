from fastapi import APIRouter
from pydantic import BaseModel, Field

router: APIRouter = APIRouter()

@router.get("/health")
def get_health():
    return {"status": "ok"}

@router.get("/")
def root():
    return {
        "title": "GeoEmploi",
        "description": "New Linkedin",
        "version": "0.1.0",
    }

class LocationPayload(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

@router.post("/api/localisation")
def save_user_location(payload: LocationPayload):
    return {
        "message": "Location received",
        "latitude": payload.latitude,
        "longitude": payload.longitude
    }