from fastapi import APIRouter
from fastapi.responses import Response

from app.services.tile_cache import TileService

tiles_router: APIRouter = APIRouter(tags=["tiles"])

tile_service: TileService = TileService()


@tiles_router.get("/tile/{z}/{x}/{y}.png")
async def serve_tile(z: int, x: int, y: int):
    tile = tile_service.get_tile(z, x, y)

    return Response(content=tile, media_type="image/png")