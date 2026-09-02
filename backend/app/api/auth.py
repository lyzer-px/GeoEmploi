from typing import Annotated
from datetime import timedelta, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from backend.app.api.localisation import geocode
from passlib.context import CryptContext
from jose import jwt, JWTError
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

from app.db.models import User
from app.db.session import db_handler
from app.schemas.user import UserCreate, Token
from app.core.config import SECRET_KEY

ALGORITHM = "HS256"
AUTH_TOKEN_EXPIRE_MINUTES = 20

auth_router = APIRouter(prefix="/auth", tags=["auth"])

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/api/token")

db_dependency = Annotated[Session, Depends(db_handler.get_session)]

@auth_router.post("/api/create-user", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, user: UserCreate):
    create_user_model = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=bcrypt_context.hash(user.password),
        city=user.base_localisation.city,
        country=user.base_localisation.country,
        address=user.base_localisation.address,
    )

    coords = await geocode(
        user.base_localisation.city,
        user.base_localisation.country,
        user.base_localisation.address,
    )
    if coords:
        create_user_model.location = from_shape(
        Point(coords.longitude, coords.latitude), srid=4326
    )

    db.add(create_user_model)
    db.commit()

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user or not bcrypt_context.verify(password, user.password):
        return False
    return user

def create_access_token(email: str, user_id: int, expires_delta: timedelta):
    expires = datetime.now(timezone.utc) + expires_delta
    encode = {"sub": email, "user_id": user_id, "exp": expires}
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

@auth_router.post("/api/token", response_model=Token)
async def login_for_access_token(
    db: db_dependency,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(
        user.email, user.id, timedelta(minutes=AUTH_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}

async def get_current_user(
    db: db_dependency,
    token: Annotated[str, Depends(oauth2_bearer)],
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if email is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate user",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user"
        )
    return user

user_dependency = Annotated[User, Depends(get_current_user)]

@auth_router.get("/login", status_code=status.HTTP_200_OK)
async def login_user(user: user_dependency):
    return {"user": user}