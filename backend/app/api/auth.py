from typing import Annotated
from datetime import timedelta, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError

from app.db import User
from app.schemas.user import UserCreate, UserIn
from app.schemas.auth import AccessToken, Token
from app.services.user_service import get_user_service, UserService
from app.services.auth_service import AuthenticationService


ALGORITHM = "HS256"
AUTH_TOKEN_EXPIRE_MINUTES = 20

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login", status_code=status.HTTP_200_OK)
def login_user(user_data: UserIn, user_service: UserService = Depends(get_user_service)):
    user: User = AuthenticationService.authenticate_user(user_data, user_service)
    access_payload: AccessToken = AuthenticationService.create_access_token_payload(user.email, user_service)
    access_token: str = AuthenticationService.create_access_token(access_payload)
    refresh_token: str = AuthenticationService.create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)

@auth_router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(new_user: UserCreate, user_service: UserService = Depends(get_user_service)):
    user: User = user_service.create_user(new_user)
    access_payload: AccessToken = AuthenticationService.create_access_token_payload(user.email, user_service)
    access_token: str = AuthenticationService.create_access_token(access_payload)
    refresh_token: str = AuthenticationService.create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)