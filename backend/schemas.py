from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


# =========================================================
# AUTH
# =========================================================

class RegisterRequest(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100,
    )

    username: str = Field(
        min_length=3,
        max_length=30,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserResponse(BaseModel):

    id: int
    name: str
    username: str
    email: EmailStr
    is_admin: bool
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )


# =========================================================
# BRAND
# =========================================================

class BrandBrief(BaseModel):

    id: int
    name: str

    model_config = ConfigDict(
        from_attributes=True,
    )


# =========================================================
# CATEGORY
# =========================================================

class CategoryBrief(BaseModel):

    id: int
    name: str
    slug: str
    parent_id: int | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


# =========================================================
# PRODUCT VARIANT
# =========================================================

class ProductVariantResponse(BaseModel):

    id: int
    product_id: int
    sku: str
    size: str
    color: str
    price: float
    stock: int
    image_url: str | None = None
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )


# =========================================================
# PRODUCT
# =========================================================

class ProductResponse(BaseModel):

    id: int
    name: str
    slug: str

    description: str | None = None

    brand_id: int
    category_id: int

    department: str
    gender: str

    base_price: float
    discount_percentage: float
    rating: float

    image_url: str | None = None

    is_featured: bool
    is_active: bool

    brand: BrandBrief
    category: CategoryBrief

    variants: list[
        ProductVariantResponse
    ] = []

    model_config = ConfigDict(
        from_attributes=True,
    )