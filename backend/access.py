from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User

from access_control import (
    ROLE_ADMIN,
    get_user_role,
)


router = APIRouter(
    prefix="/access",
    tags=["Access"],
)


# =========================================================
# CURRENT USER ACCESS
# =========================================================

@router.get("/me")
def my_access(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):

    role = get_user_role(
        db,
        current_user,
    )


    return {
        "user_id":
            current_user.id,

        "name":
            current_user.name,

        "username":
            current_user.username,

        "email":
            current_user.email,

        "role":
            role,

        "is_admin":
            role == ROLE_ADMIN,

        "is_customer":
            role != ROLE_ADMIN,
    }