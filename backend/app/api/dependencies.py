from typing import Annotated

from jose import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import SECRET_KEY, ALGORITHM
from app.db.models.rbac import User
from app.schemas.input.auth import AccessToken, RefreshToken, RefreshTokenRequest
from app.services.user_service import UserService, get_user_service
from app.services.roles_service import RoleService, get_role_service
from app.services.offer_service import OfferService, get_offer_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

permissions_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="You do not have the necessary permissions to perform this action.",
)

UserServiceDep = Annotated[UserService, Depends(get_user_service)]
RoleServiceDep = Annotated[RoleService, Depends(get_role_service)]
OfferServiceDep = Annotated[OfferService, Depends(get_offer_service)]


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

def require_permission(permission_name: str):
    def dependency(
        user: CurrentUserDep,
        role_service: RoleServiceDep,
    ) -> User:
        if not role_service.has_permission(user, permission_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission_name}",
            )

        return user
    return dependency