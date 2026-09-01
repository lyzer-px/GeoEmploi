from routes import router
from app.schemas.user import JobOffer

@router.post("/job_offers")
async def create_job_offer(data: JobOffer, db: Session = Depends(get_db)):
    offer = JobOffer(
        city=data.city,
        country=data.country,
        address=data.address,
        latitude=data.localisation.latitude,
        longitude=data.localisation.longitude,
    )
    db.add(offer)
    db.commit()
    return offer