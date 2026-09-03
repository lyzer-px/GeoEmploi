from fastapi import Depends
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

from app.api.routes import router
from app.schemas.localisation import FixedLocalisation, PreciseLocalisation
from app.db.session import get_db
from app.api.auth import get_current_user
from app.services.geocoding import geocode

@router.post("/api/localisation")
async def set_user_base_location(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    local: FixedLocalisation,
):
    coords = await geocode(local.city, local.country, local.address)
    if coords:
        current_user.location = from_shape(
            Point(coords.longitude, coords.latitude), srid=4326
        )

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {"message": "Localisation mise à jour"}

@router.post("/api/localisation/current")
async def receive_current_location(local: PreciseLocalisation):
    return {"latitude": local.latitude, "longitude": local.longitude}

