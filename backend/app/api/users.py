from fastapi import APIRouter


from app.schemas.localisation import Localisation
from app.schemas.user import UserCreate, UserUpdate

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


@router.get("/users")
def get_users():
    """Retrieve a list of all users"""
    ...


@router.get("/users/{id}")
def get_user(id: int):
    """Retrieve a single user"""
    ...


@router.post("/users")
def create_user(user: UserCreate):
    """Create a new user"""
    ...


@router.put("/users/{id}")
def update_user(id: int, user: UserUpdate):
    """Update user information"""
    ...


@router.delete("/users/{id}")
def delete_user(id: int):
    """Delete a user"""
    ...


# créer un user(/api/creat)
# login un user
# logout un user
# supprimer un user
# modifier un user(password, first_name, last_name, password)

# Ajouter une offre()
# Supprimer une offre
