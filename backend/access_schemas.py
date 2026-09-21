from typing import Literal, Optional

from pydantic import BaseModel, Field


RoleName = Literal[
    "customer",
    "admin",
]


# =========================================================
# ROLE UPDATE
# =========================================================

class RoleUpdateRequest(BaseModel):
    role: RoleName


# =========================================================
# SHOPKEEPER ASSIGNMENT
# =========================================================

class ShopkeeperAssignmentRequest(BaseModel):
    shopkeeper_user_id: int


# =========================================================
# SHOPKEEPER VARIANT UPDATE
# =========================================================

class ShopkeeperVariantUpdateRequest(BaseModel):

    price: Optional[float] = Field(
        default=None,
        gt=0,
    )

    stock: Optional[int] = Field(
        default=None,
        ge=0,
    )

    is_active: Optional[bool] = None