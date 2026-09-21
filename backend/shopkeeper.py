from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db

from models import (
    Product,
    ProductVariant,
    User,
)

from access_models import (
    ShopkeeperProduct,
)

from access_control import (
    require_shopkeeper,
)

from access_schemas import (
    ShopkeeperVariantUpdateRequest,
)


router = APIRouter(
    prefix="/shopkeeper",
    tags=["Shopkeeper"],
)


# =========================================================
# PRODUCT IDS
# =========================================================

def get_shopkeeper_product_ids(
    db: Session,
    user_id: int,
):

    assignments = (
        db.query(
            ShopkeeperProduct
        )
        .filter(
            ShopkeeperProduct.shopkeeper_user_id ==
            user_id
        )
        .all()
    )


    return [
        assignment.product_id

        for assignment
        in assignments
    ]


# =========================================================
# VERIFY PRODUCT OWNERSHIP
# =========================================================

def shopkeeper_owns_product(
    db: Session,
    user_id: int,
    product_id: int,
):

    assignment = (
        db.query(
            ShopkeeperProduct
        )
        .filter(
            ShopkeeperProduct.shopkeeper_user_id ==
            user_id,

            ShopkeeperProduct.product_id ==
            product_id,
        )
        .first()
    )


    return assignment is not None


# =========================================================
# SUMMARY
# =========================================================

@router.get("/summary")
def shopkeeper_summary(
    current_user: User = Depends(
        require_shopkeeper
    ),
    db: Session = Depends(
        get_db
    ),
):

    product_ids = (
        get_shopkeeper_product_ids(
            db,
            current_user.id,
        )
    )


    if not product_ids:

        return {
            "shopkeeper":
                current_user.username,

            "products":
                0,

            "active_products":
                0,

            "total_stock":
                0,

            "variants":
                0,
        }


    product_count = (
        db.query(
            func.count(
                Product.id
            )
        )
        .filter(
            Product.id.in_(
                product_ids
            )
        )
        .scalar()
        or 0
    )


    active_product_count = (
        db.query(
            func.count(
                Product.id
            )
        )
        .filter(
            Product.id.in_(
                product_ids
            ),

            Product.is_active.is_(True),
        )
        .scalar()
        or 0
    )


    total_stock = (
        db.query(
            func.sum(
                ProductVariant.stock
            )
        )
        .filter(
            ProductVariant.product_id.in_(
                product_ids
            ),

            ProductVariant.is_active.is_(True),
        )
        .scalar()
        or 0
    )


    variant_count = (
        db.query(
            func.count(
                ProductVariant.id
            )
        )
        .filter(
            ProductVariant.product_id.in_(
                product_ids
            )
        )
        .scalar()
        or 0
    )


    return {
        "shopkeeper":
            current_user.username,

        "products":
            int(
                product_count
            ),

        "active_products":
            int(
                active_product_count
            ),

        "total_stock":
            int(
                total_stock
            ),

        "variants":
            int(
                variant_count
            ),
    }


# =========================================================
# OWN PRODUCTS
# =========================================================

@router.get("/products")
def shopkeeper_products(
    current_user: User = Depends(
        require_shopkeeper
    ),
    db: Session = Depends(
        get_db
    ),
):

    product_ids = (
        get_shopkeeper_product_ids(
            db,
            current_user.id,
        )
    )


    if not product_ids:

        return []


    products = (
        db.query(Product)
        .filter(
            Product.id.in_(
                product_ids
            )
        )
        .order_by(
            Product.id.desc()
        )
        .all()
    )


    response = []


    for product in products:

        variants = (
            db.query(
                ProductVariant
            )
            .filter(
                ProductVariant.product_id ==
                product.id
            )
            .order_by(
                ProductVariant.id
            )
            .all()
        )


        response.append({
            "id":
                product.id,

            "name":
                product.name,

            "slug":
                product.slug,

            "department":
                product.department,

            "base_price":
                product.base_price,

            "discount_percentage":
                product.discount_percentage,

            "rating":
                product.rating,

            "image_url":
                product.image_url,

            "is_active":
                product.is_active,

            "variants": [
                {
                    "id":
                        variant.id,

                    "sku":
                        variant.sku,

                    "size":
                        variant.size,

                    "color":
                        variant.color,

                    "price":
                        variant.price,

                    "stock":
                        variant.stock,

                    "image_url":
                        variant.image_url,

                    "is_active":
                        variant.is_active,
                }

                for variant
                in variants
            ],
        })


    return response


# =========================================================
# UPDATE OWN VARIANT
# =========================================================

@router.patch(
    "/variants/{variant_id}"
)
def update_shopkeeper_variant(
    variant_id: int,
    payload:
        ShopkeeperVariantUpdateRequest,

    current_user: User = Depends(
        require_shopkeeper
    ),

    db: Session = Depends(
        get_db
    ),
):

    variant = (
        db.query(
            ProductVariant
        )
        .filter(
            ProductVariant.id ==
            variant_id
        )
        .first()
    )


    if not variant:

        raise HTTPException(
            status_code=404,
            detail="Variant not found.",
        )


    owns_product = (
        shopkeeper_owns_product(
            db,
            current_user.id,
            variant.product_id,
        )
    )


    if not owns_product:

        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have permission "
                "to modify this product."
            ),
        )


    if (
        payload.price is None
        and
        payload.stock is None
        and
        payload.is_active is None
    ):

        raise HTTPException(
            status_code=400,
            detail="No changes supplied.",
        )


    if payload.price is not None:

        variant.price = float(
            payload.price
        )


    if payload.stock is not None:

        variant.stock = int(
            payload.stock
        )


    if payload.is_active is not None:

        variant.is_active = (
            payload.is_active
        )


    db.commit()

    db.refresh(
        variant
    )


    return {
        "message":
            "Inventory updated.",

        "variant": {
            "id":
                variant.id,

            "product_id":
                variant.product_id,

            "sku":
                variant.sku,

            "size":
                variant.size,

            "color":
                variant.color,

            "price":
                variant.price,

            "stock":
                variant.stock,

            "is_active":
                variant.is_active,
        },
    }