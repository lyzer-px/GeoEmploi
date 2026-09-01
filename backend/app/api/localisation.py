from app.schemas.user import Localisation
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from routes import router

@router.post("/api/position")
async def send_position(localisation: Localisation):
    return {
        "message": "Position received",
        "latitude": localisation.latitude,
        "longitude": localisation.longitude,
        "timestamp": localisation.timestamp
    }