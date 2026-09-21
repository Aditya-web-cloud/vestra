from datetime import (
    datetime,
    timedelta,
    timezone,
)

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordBearer,
)

from jose import (
    JWTError,
    jwt,
)

from sqlalchemy.orm import Session

from database import get_db
from models import User


# =========================================================
# JWT SETTINGS
# =========================================================

SECRET_KEY = (
    "vestra-development-secret-key-"
    "change-this-before-production"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 1440


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# =========================================================
# CREATE TOKEN
# =========================================================

def create_access_token(
    user_id: int,
):

    expire = (
        datetime.now(
            timezone.utc
        )
        +
        timedelta(
            minutes=
                ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )


    payload = {
        "sub": str(user_id),

        "exp": expire,
    }


    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


    return token


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(
        oauth2_scheme
    ),

    db: Session = Depends(
        get_db
    ),
):

    credentials_exception = (
        HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Could not validate credentials.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            },
        )
    )


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ],
        )


        user_id = (
            payload.get(
                "sub"
            )
        )


        if user_id is None:

            raise (
                credentials_exception
            )


        user_id = int(
            user_id
        )


    except (
        JWTError,
        ValueError,
        TypeError,
    ):

        raise credentials_exception


    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.is_active == True,
        )
        .first()
    )


    if not user:

        raise credentials_exception


    return user


# =========================================================
# ADMIN
# =========================================================

def get_current_admin(
    current_user: User = Depends(
        get_current_user
    ),
):

    if not current_user.is_admin:

        raise HTTPException(
            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "Administrator access required.",
        )


    return current_user