import httpx

from app.core.config import GOUV_ADDRESS_API_URL
from app.schemas.localisation import PreciseLocalisation


async def geocode(city: str, country: str, address: str) -> PreciseLocalisation | None:
    query = f"{address}, {city}"

    async with httpx.AsyncClient() as client:
        r = await client.get(
            GOUV_ADDRESS_API_URL,
            params={"q": query, "limit": 1},
        )
    results = r.json()
    if not results:
        return None
    return PreciseLocalisation(
        latitude=float(results[0]["lat"]),
        longitude=float(results[0]["lon"])
    )