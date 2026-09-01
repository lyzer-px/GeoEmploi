from fastapi import APIRouter
from app.schemas.user import UserCreate, UserIn, Location

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
async def save_user_location(payload: Location):
    return {
        "message": "Localisation received",
        "latitude": payload.latitude,
        "longitude": payload.longitude
    }


@router.post("/api/create-user")
async def create_user(user: UserCreate):
    return {
        "message": "User created",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    }

@router.post("/api/login")
async def login_user(user: UserIn):
    return {
        "message": "User logged in",
        "email": user.email
    }