from routes import router
from app.schemas.user import JobOffer

@router.post("/api/job-offer")
async def create_job_offer(job_offer: JobOffer):
    return {
        "message": "Job offer created",
        "title": job_offer.title,
        "description": job_offer.description,
        "recruiter": job_offer.recruiter_id
    }