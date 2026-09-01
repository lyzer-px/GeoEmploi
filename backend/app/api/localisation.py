from app.schemas.user import Localisation

from routes import router

@router.post("/api/position")
async def send_position(localisation: Localisation):
    return {
        "message": "Position received",
        "latitude": localisation.latitude,
        "longitude": localisation.longitude,
        "timestamp": localisation.timestamp
    }