from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from database import Base


# =========================================================
# USER
# =========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(120),
        nullable=False,
    )

    username = Column(
        String(80),
        unique=True,
        nullable=False,
        index=True,
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    hashed_password = Column(
        String(255),
        nullable=False,
    )

    is_admin = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    addresses = relationship(
        "Address",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    wishlist = relationship(
        "Wishlist",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    cart = relationship(
        "Cart",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    orders = relationship(
        "Order",
        back_populates="user",
    )

    reviews = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# =========================================================
# BRAND
# =========================================================

class Brand(Base):

    __tablename__ = "brands"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(120),
        unique=True,
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    logo_url = Column(
        String(500),
        nullable=True,
    )

    products = relationship(
        "Product",
        back_populates="brand",
    )


# =========================================================
# CATEGORY
# =========================================================

class Category(Base):

    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(120),
        nullable=False,
    )

    slug = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    parent_id = Column(
        Integer,
        ForeignKey(
            "categories.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    parent = relationship(
        "Category",
        remote_side=[id],
        back_populates="children",
    )

    children = relationship(
        "Category",
        back_populates="parent",
    )

    products = relationship(
        "Product",
        back_populates="category",
    )


# =========================================================
# PRODUCT
# =========================================================

class Product(Base):

    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    slug = Column(
        String(220),
        unique=True,
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    brand_id = Column(
        Integer,
        ForeignKey(
            "brands.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    category_id = Column(
        Integer,
        ForeignKey(
            "categories.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    department = Column(
        String(80),
        nullable=False,
        index=True,
    )

    gender = Column(
        String(40),
        nullable=True,
        index=True,
    )

    base_price = Column(
        Float,
        nullable=False,
        default=0,
    )

    discount_percentage = Column(
        Float,
        nullable=False,
        default=0,
    )

    rating = Column(
        Float,
        nullable=False,
        default=0,
    )

    image_url = Column(
        String(500),
        nullable=True,
    )

    is_featured = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    brand = relationship(
        "Brand",
        back_populates="products",
    )

    category = relationship(
        "Category",
        back_populates="products",
    )

    variants = relationship(
        "ProductVariant",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    wishlist_items = relationship(
        "WishlistItem",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    reviews = relationship(
        "Review",
        back_populates="product",
        cascade="all, delete-orphan",
    )


# =========================================================
# PRODUCT VARIANT
# =========================================================

class ProductVariant(Base):

    __tablename__ = "product_variants"

    id = Column(
        Integer,
        primary_key=True,
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

    sku = Column(
        String(120),
        unique=True,
        nullable=False,
        index=True,
    )

    size = Column(
        String(40),
        nullable=True,
    )

    color = Column(
        String(80),
        nullable=True,
    )

    price = Column(
        Float,
        nullable=False,
    )

    stock = Column(
        Integer,
        nullable=False,
        default=0,
    )

    image_url = Column(
        String(500),
        nullable=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    product = relationship(
        "Product",
        back_populates="variants",
    )

    cart_items = relationship(
        "CartItem",
        back_populates="variant",
    )

    order_items = relationship(
        "OrderItem",
        back_populates="variant",
    )


# =========================================================
# WISHLIST
# =========================================================

class Wishlist(Base):

    __tablename__ = "wishlists"

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
        unique=True,
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="wishlist",
    )

    items = relationship(
        "WishlistItem",
        back_populates="wishlist",
        cascade="all, delete-orphan",
    )


class WishlistItem(Base):

    __tablename__ = "wishlist_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    wishlist_id = Column(
        Integer,
        ForeignKey(
            "wishlists.id",
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

    wishlist = relationship(
        "Wishlist",
        back_populates="items",
    )

    product = relationship(
        "Product",
        back_populates="wishlist_items",
    )

    __table_args__ = (
        UniqueConstraint(
            "wishlist_id",
            "product_id",
            name="uq_wishlist_product",
        ),
    )


# =========================================================
# CART
# =========================================================

class Cart(Base):

    __tablename__ = "carts"

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
        unique=True,
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="cart",
    )

    items = relationship(
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
    )


class CartItem(Base):

    __tablename__ = "cart_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    cart_id = Column(
        Integer,
        ForeignKey(
            "carts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    variant_id = Column(
        Integer,
        ForeignKey(
            "product_variants.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    cart = relationship(
        "Cart",
        back_populates="items",
    )

    variant = relationship(
        "ProductVariant",
        back_populates="cart_items",
    )

    __table_args__ = (
        UniqueConstraint(
            "cart_id",
            "variant_id",
            name="uq_cart_variant",
        ),
    )


# =========================================================
# ADDRESS
# =========================================================

class Address(Base):

    __tablename__ = "addresses"

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
        index=True,
    )

    name = Column(
        String(120),
        nullable=False,
    )

    phone = Column(
        String(30),
        nullable=True,
    )

    address_line1 = Column(
        String(255),
        nullable=False,
    )

    address_line2 = Column(
        String(255),
        nullable=True,
    )

    city = Column(
        String(100),
        nullable=False,
    )

    state = Column(
        String(100),
        nullable=False,
    )

    pincode = Column(
        String(20),
        nullable=False,
    )

    is_default = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="addresses",
    )


# =========================================================
# ORDER
# =========================================================

class Order(Base):

    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
    )

    payment_status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
    )

    shipping_address = Column(
        Text,
        nullable=True,
    )

    tracking_number = Column(
        String(100),
        nullable=True,
        index=True,
    )

    courier_name = Column(
        String(100),
        nullable=True,
    )

    current_location = Column(
        String(200),
        nullable=True,
    )

    estimated_delivery = Column(
        String(100),
        nullable=True,
    )

    tracking_events = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="orders",
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )


# =========================================================
# ORDER ITEM
# =========================================================

class OrderItem(Base):

    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    order_id = Column(
        Integer,
        ForeignKey(
            "orders.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    variant_id = Column(
        Integer,
        ForeignKey(
            "product_variants.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    product_name = Column(
        String(200),
        nullable=False,
    )

    size = Column(
        String(40),
        nullable=True,
    )

    color = Column(
        String(80),
        nullable=True,
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1,
    )

    unit_price = Column(
        Float,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    order = relationship(
        "Order",
        back_populates="items",
    )

    variant = relationship(
        "ProductVariant",
        back_populates="order_items",
    )


# =========================================================
# REVIEW
# =========================================================

class Review(Base):

    __tablename__ = "reviews"

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

    rating = Column(
        Integer,
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="reviews",
    )

    product = relationship(
        "Product",
        back_populates="reviews",
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_user_product_review",
        ),
    )