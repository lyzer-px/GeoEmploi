import math
from dataclasses import dataclass

from geopy.distance import distance, Point


@dataclass
class BoundingBox:
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float


def perimeter_to_radius(perimeter_km: float) -> float:
    return perimeter_km / (2 * math.pi)

def get_bounding_box(
    latitude: float, longitude: float, radius_km: float
) -> BoundingBox:
    north: Point = distance(kilometers=radius_km).destination((latitude, longitude), 0)
    south: Point = distance(kilometers=radius_km).destination((latitude, longitude), 180)
    east: Point = distance(kilometers=radius_km).destination((latitude, longitude), 90)
    west: Point = distance(kilometers=radius_km).destination((latitude, longitude), 270)
    return BoundingBox(south.latitude, north.latitude, west.longitude, east.longitude)
