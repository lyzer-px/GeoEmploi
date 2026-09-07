import math
import httpx

from fastapi import Depends
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.database import get_db_session

TILE_CACHE_DIR = Path("storage/tile_cache")
TILE_CACHE_DIR.mkdir(parents=True, exist_ok=True)

WMTS_URL = "https://data.geopf.fr/wmts"


class TileService:
    def __init__(self):
        self.cache_dir = TILE_CACHE_DIR

    def tile_path(self, z: int, x: int, y: int) -> Path:
        return self.cache_dir / f"{z}_{x}_{y}.png"

    def is_cached(self, z: int, x: int, y: int) -> bool:
        return self.tile_path(z, x, y).is_file()

    def read_from_cache(self, z: int, x: int, y: int) -> bytes:
        return self.tile_path(z, x, y).read_bytes()

    def save_to_cache(self, z: int, x: int, y: int, data: bytes):
        self.tile_path(z, x, y).write_bytes(data)

    def download_tile(self, z: int, x: int, y: int) -> bytes:
        params = {
            "SERVICE": "WMTS",
            "REQUEST": "GetTile",
            "VERSION": "1.0.0",
            "LAYER": "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
            "STYLE": "normal",
            "FORMAT": "image/png",
            "TILEMATRIXSET": "PM",
            "TILEMATRIX": z,
            "TILEROW": y,
            "TILECOL": x,
        }
        response = httpx.get(WMTS_URL, params=params)
        response.raise_for_status()
        return response.content

    def get_tile(self, z: int, x: int, y: int) -> bytes:
        if self.is_cached(z, x, y):
            return self.read_from_cache(z, x, y)

        data = self.download_tile(z, x, y)
        self.save_to_cache(z, x, y, data)
        return data

    def deg2tile(self, lat: float, lon: float, zoom: int) -> tuple[int, int]:
        lat_rad = math.radians(lat)
        n = 2.0**zoom
        x = int((lon + 180.0) / 360.0 * n)
        y = int(
            (1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi)
            / 2.0
            * n
        )
        return x, y


def get_tile_service(session: Session = Depends(get_db_session)) -> TileService:
    return TileService()
