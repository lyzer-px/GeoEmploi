import httpx

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes import router
from app.schemas.user import PreciseLocalisation
from app.db.session import get_db
from app.api.auth import get_current_user
from app.db.models import User

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "geo-emploi/1.0 (ton-email@exemple.com)"  # remplace par un vrai contact


async def geocode_address(city: str, country: str, address: str) -> PreciseLocalisation | None:
    query = f"{address}, {city}, {country}"

    async with httpx.AsyncClient() as client:
        r = await client.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1},
            headers={"User-Agent": USER_AGENT},
        )
        r.raise_for_status()

    results = r.json()
    if not results:
        return None

    return PreciseLocalisation(
        latitude=float(results[0]["lat"]),
        longitude=float(results[0]["lon"]),
    )

@router.post("/api/localisation")
async def set_user_base_location(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.location = current_user.base_localisation

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {"message": "Localisation mise à jour"}

@router.post("/api/localisation/current")
async def receive_current_location(local: PreciseLocalisation):
    return {"latitude": local.latitude, "longitude": local.longitude}

async def geocode(address: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": address, "format": "json", "limit": 1},
            headers={"User-Agent": "geo-emploi/1.0 (ton-email@exemple.com)"},
        )
    results = r.json()
    if not results:
        return None
    return PreciseLocalisation(
        latitude=float(results[0]["lat"]),
        longitude=float(results[0]["lon"])
    )