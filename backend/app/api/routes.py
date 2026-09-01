from fastapi import APIRouter
from app.schemas.user import Localisation

router: APIRouter = APIRouter()


@router.get("/health")
def get_health():
    return {"status": "ok"}


@router.get("/")
async def root():
    return {
        "title": "GeoEmploi",
        "description": "New Linkedin",
        "version": "0.1.0",
    }


@router.post("/api/localisation")
async def save_user_location(local: Localisation):
    return {
        "message": "Localisation received",
        "latitude": local.latitude,
        "longitude": local.longitude,
    }


# créer un user
# login un user
# supprimer un user
# modifier un user(password, first_name, last_name, password)

# Ajouter une offre()
# Supprimer une offre
# 
