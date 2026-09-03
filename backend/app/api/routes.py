from fastapi import APIRouter

rooter: APIRouter = APIRouter()


@rooter.get("/health")
def get_health():
    return {"status": "ok"}


@rooter.get("/")
def root():
    return {
        "title": "GeoEmploi",
        "description": "New Linkedin",
        "version": "0.1.0",
    }

from fastapi import APIRouter
from fastapi.responses import Response

from app.services.tile_cache import get_tile

router = APIRouter()

@router.get("/tile/{z}/{y}/{x}.png")
async def serve_tile(z: int, y: int, x: int):
    tile = get_tile(z, x, y)
    return Response(content=tile, media_type="image/png")