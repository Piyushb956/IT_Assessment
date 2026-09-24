import os

from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour login session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# tokenUrl is only used to show a "lock" icon in /docs — actual auth reads the header directly
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int, role: str, name: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "name": name, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


class CurrentUser:
    def __init__(self, id: int, role: str, name: str):
        self.id = id
        self.role = role
        self.name = name


def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    # """Decodes the token sent by the frontend. This is the ONLY source of truth
    # for who is making the request — never trust a role or user_id sent as a
    # query param or in the request body."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("sub")
    role = payload.get("role")
    if user_id is None or role is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    return CurrentUser(id=int(user_id), role=role, name=payload.get("name"))


def require_role(*allowed_roles: str):
    # """Route dependency: only requests carrying a token with one of these
    # roles may proceed. Everyone else gets a 403, no matter what the frontend
    # intended to send."""
    def checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this action")
        return current_user
    return checker