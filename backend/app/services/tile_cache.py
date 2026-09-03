import math
import httpx
from pathlib import Path

TILE_CACHE_DIR = Path("app/services/tile_cache")
TILE_CACHE_DIR.mkdir(exist_ok=True)

WMTS_URL = "https://data.geopf.fr/wmts"


def tile_path(z: int, x: int, y: int) -> Path:
    return TILE_CACHE_DIR / f"{z}_{x}_{y}.png"


def is_cached(z: int, x: int, y: int) -> bool:
    return tile_path(z, x, y).exists()


def read_from_cache(z: int, x: int, y: int) -> bytes:
    return tile_path(z, x, y).read_bytes()


def save_to_cache(z: int, x: int, y: int, data: bytes):
    tile_path(z, x, y).write_bytes(data)


def download_tile(z: int, x: int, y: int) -> bytes:
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


def get_tile(z: int, x: int, y: int) -> bytes:
    if is_cached(z, x, y):
        return read_from_cache(z, x, y)

    data = download_tile(z, x, y)
    save_to_cache(z, x, y, data)
    return data

def deg2tile(lat: float, lon: float, zoom: int) -> tuple[int, int]:
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n)
    return x, y
