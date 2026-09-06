from fastapi import APIRouter

applications_router = APIRouter(tags=["applications"])


@applications_router.post("/{offer_id}")
def create_application():
    pass
