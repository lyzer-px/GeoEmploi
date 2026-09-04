from typing import Annotated

from jose import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import SECRET_KEY, ALGORITHM
from app.db.models.rbac import User
from app.schemas.input.auth import AccessToken, RefreshToken, RefreshTokenRequest
from app.services.user_service import UserService, get_user_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

permissions_exception = HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have the necessary permissions to perform this action."
        )

UserServiceDep = Annotated[UserService, Depends(get_user_service)]


def get_current_token_payload(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> AccessToken:

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return AccessToken.model_validate(payload)
    except Exception:
        raise credentials_exception


AccessTokenDep = Annotated[AccessToken, Depends(get_current_token_payload)]


def get_current_user(
    payload: AccessTokenDep,
    user_service: UserServiceDep,
) -> User:
    user = user_service.get_user_by_id(payload.user_id)

    if not user:
        raise credentials_exception
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


def verify_refresh_token(body: RefreshTokenRequest) -> RefreshToken:
    try:
        payload = jwt.decode(body.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        refresh_payload = RefreshToken.model_validate(payload)

        if refresh_payload.token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        return refresh_payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )


RefreshTokenDep = Annotated[RefreshToken, Depends(verify_refresh_token)]

def require_offer_creation_permission(user: User, user_service: UserServiceDep) -> User:
    roles: list[str] = user_service.get_stringify_roles_of_user(user)
    if "create:offer" not in current_user.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits nécessaires pour créer une offre."
        )
    return current_user
