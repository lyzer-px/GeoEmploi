#from typing import Annotated
#from datetime import timedelta, datetime
#
from fastapi import APIRouter, Depends, HTTPException
#from sqlalchemy.orm import Session
#from starlette import status
#from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
#from jose import jwt, JWTError
#
#from app.db import User
#from app.schemas.user import UserCreate
#
#
#ALGORITHM = "HS256"
#AUTH_TOKEN_EXPIRE_MINUTES = 20
#
auth_router = APIRouter(prefix="/auth", tags=["auth"])
#
#bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/api/token")
#
#
#db_dependency = Annotated[Session, Depends(get_db)]
#
#
#@auth_router.post("/api/create-user", status=status.HTTP_201_CREATED)
#async def create_user(db: db_dependency, user: UserCreate):
#    create_user_model = UserCreate(
#        first_name=user.first_name,
#        last_name=user.last_name,
#        email=user.email,
#        password=bcrypt_context.hash(user.password),
#    )
#    db.add(create_user_model)
#    db.commit()
#
#
#@auth_router.post("/api/token", response_model=Token)
#async def login_for_access_token(
#    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
#):
#    user = authenticate_user(form_data.username, form_data.password)
#    if not user:
#        raise HTTPException(
#            status_code=status.HTTP_401_UNAUTHORIZED,
#            detail="Incorrect email or password",
#        )
#    token = create_access_token(
#        user.email, user.id, timedelta(minutes=AUTH_TOKEN_EXPIRE_MINUTES)
#    )
#    return {"access_token": token, "token_type": "bearer"}
#
#
#async def authenticate_user(email: str, password: str, db: db_dependency):
#    user = db.query(User).filter(User.email == email).first()
#    if not user or not bcrypt_context.verify(password, user.password):
#        return False
#    return user
#
#
#def create_access_token(email: str, user_id: int, expires_delta: timedelta):
#    encode = {
#        "sub": email,
#        "user_id": user_id,
#        "exp": datetime.now(datetime.timezone.utc),
#    }
#    expires = datetime.now(datetime.timezone.utc) + expires_delta
#    encode.update({"exp": expires})
#    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
#
#
#async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
#    try:
#        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#        email: str = payload.get("sub")
#        user_id: int = payload.get("user_id")
#        if email is None or user_id is None:
#            raise HTTPException(
#                status_code=status.HTTP_401_UNAUTHORIZED,
#                detail="Could not validate user",
#            )
#        return {"email": email, "user_id": user_id}
#    except JWTError:
#        raise HTTPException(
#            status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user"
#        )
#
#
#user_dependency = Annotated[User, Depends(get_current_user)]
#
#
#@auth_router.get("/login", status_code=status.HTTP_200_OK)
#async def login_user(user: user_dependency):
#    if not user:
#        raise HTTPException(
#            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed"
#        )
#    return {"user": user}
#