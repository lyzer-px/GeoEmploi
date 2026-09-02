from sqlalchemy.orm import Session
from sqlalchemy import select
from geoalchemy2.functions import ST_DWithin, ST_Distance
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

from app.db.models import Offer, User

def find_nearby_offers(
        db: Session,
        latitude: float,
        longitude: float,
        radius_m: int) -> list[tuple[Offer, float]]:

    user_point = from_shape(Point(longitude, latitude), srid=4326)

    stmt = (
        select(Offer, ST_Distance(User.location, user_point).label("distance"))
        .join(Offer.employer)
        .where(ST_DWithin(User.location, user_point, radius_m))
        .order_by("distance")
    )

    result = db.execute(stmt)
    return result.all()