from app.schemas.offer import NearbyOfferOut, NearbyOffersQuery
from services.proximity.query import find_nearby_offers

from main import router, db_dependency

@router.post("/offers/nearby", response_model=list[NearbyOfferOut])
async def get_nearby_offers(query: NearbyOffersQuery, db: db_dependency):
    rows = find_nearby_offers(db, query.latitude, query.longitude, query.radius_m)

    return [NearbyOfferOut(
                id=offer.id,
                name=offer.name,
                description=offer.description,
                distance_m=distance)
            for offer, distance in rows]