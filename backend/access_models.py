from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)

from database import Base


# =========================================================
# USER ACCESS
# =========================================================

class UserAccess(Base):

    __tablename__ = "user_access"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    role = Column(
        String(20),
        nullable=False,
        default="customer",
        index=True,
    )

    is_approved = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =========================================================
# SHOPKEEPER → PRODUCT OWNERSHIP
# =========================================================

class ShopkeeperProduct(Base):

    __tablename__ = "shopkeeper_products"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    shopkeeper_user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey(
            "products.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            name="uq_shopkeeper_product_product",
        ),
    )