from fastapi import (
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User

from access_models import UserAccess


# =========================================================
# ROLES
# =========================================================

ROLE_CUSTOMER = "customer"
ROLE_ADMIN = "admin"
ROLE_SHOPKEEPER = "shopkeeper"


VALID_ROLES = {
    ROLE_CUSTOMER,
    ROLE_ADMIN,
}


# =========================================================
# GET ACCESS RECORD
# =========================================================

def get_access_record(
    db: Session,
    user_id: int,
):

    return (
        db.query(UserAccess)
        .filter(
            UserAccess.user_id == user_id
        )
        .first()
    )


# =========================================================
# GET USER ROLE
# =========================================================

def get_user_role(
    db: Session,
    user: User,
):

    access = get_access_record(
        db,
        user.id,
    )


    if access:

        if not access.is_approved:

            return ROLE_CUSTOMER


        if access.role in VALID_ROLES:

            return access.role


    # -----------------------------------------------------
    # Compatibility with old VESTRA is_admin field
    # -----------------------------------------------------

    if getattr(
        user,
        "is_admin",
        False,
    ):

        return ROLE_ADMIN


    return ROLE_CUSTOMER


# =========================================================
# ADMIN ACCESS
# =========================================================

def require_admin(
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


    if role != ROLE_ADMIN:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )


    return current_user


# =========================================================
# SHOPKEEPER ACCESS
# =========================================================

def require_shopkeeper(
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


    if role != ROLE_SHOPKEEPER:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Shopkeeper access required.",
        )


    return current_user


# =========================================================
# STAFF ACCESS
# Admin only
# =========================================================

def require_staff(
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


    if role != ROLE_ADMIN:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )


    return current_user