import json
import re
from typing import List, Optional
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from pydantic import BaseModel, Field

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db

from models import (
    Brand,
    Category,
    Order,
    OrderItem,
    Product,
    ProductVariant,
    User,
)

from access_models import UserAccess

from access_schemas import RoleUpdateRequest

from access_control import (
    ROLE_ADMIN,
    ROLE_CUSTOMER,
    get_user_role,
    require_admin,
)

from order_tracking import (
    initialize_order_tracking_fields,
    append_tracking_event,
    build_tracking_payload,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# =========================================================
# SCHEMAS
# =========================================================

class AdminVariantUpdateRequest(BaseModel):
    price: Optional[float] = Field(
        default=None,
        ge=0,
    )
    stock: Optional[int] = Field(
        default=None,
        ge=0,
    )
    is_active: Optional[bool] = None


class AdminVariantUpdateItem(BaseModel):
    id: int
    stock: Optional[int] = Field(
        None,
        ge=0,
    )
    is_active: Optional[bool] = None


class AdminOrderStatusUpdateRequest(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None


class AdminOrderTrackingUpdateRequest(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    courier_name: Optional[str] = None
    tracking_number: Optional[str] = None
    current_location: Optional[str] = None
    estimated_delivery: Optional[str] = None
    checkpoint_title: Optional[str] = None
    checkpoint_description: Optional[str] = None


class AdminProductVariantCreate(BaseModel):
    size: Optional[str] = "Free Size"
    color: Optional[str] = "Standard"
    price: Optional[float] = None
    stock: int = Field(default=10, ge=0)
    sku: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True


class AdminProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = ""
    department: str = Field(default="Women")
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    gender: Optional[str] = "Women"
    base_price: float = Field(..., ge=0)
    discount_percentage: float = Field(default=0.0, ge=0, le=100)
    image_url: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    variants: Optional[List[AdminProductVariantCreate]] = None


class AdminProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    gender: Optional[str] = None
    base_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


# =========================================================
# SUMMARY
# =========================================================

@router.get("/summary")
def admin_summary(
    _: User = Depends(
        require_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    users = db.query(User).all()

    role_counts = {
        ROLE_CUSTOMER: 0,
        ROLE_ADMIN: 0,
    }

    for user in users:
        role = get_user_role(db, user)
        if role in role_counts:
            role_counts[role] += 1
        elif role == "admin":
            role_counts[ROLE_ADMIN] += 1
        else:
            role_counts[ROLE_CUSTOMER] += 1

    product_count = (
        db.query(func.count(Product.id)).scalar() or 0
    )

    active_product_count = (
        db.query(func.count(Product.id))
        .filter(Product.is_active.is_(True))
        .scalar()
        or 0
    )

    order_count = (
        db.query(func.count(Order.id)).scalar() or 0
    )

    total_revenue = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.payment_status.in_(["paid", "confirmed"]))
        .scalar()
        or 0
    )

    pending_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status.in_(["pending", "confirmed", "processing"]))
        .scalar()
        or 0
    )

    total_stock = (
        db.query(func.sum(ProductVariant.stock)).scalar() or 0
    )

    return {
        "customers": role_counts[ROLE_CUSTOMER],
        "admins": role_counts[ROLE_ADMIN],
        "products": product_count,
        "active_products": active_product_count,
        "orders": order_count,
        "total_revenue": round(float(total_revenue), 2),
        "pending_orders": pending_orders,
        "total_stock": total_stock,
    }


from payment_models import PaymentIntent


# =========================================================
# USERS
# =========================================================

@router.get("/users")
def admin_users(
    _: User = Depends(
        require_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    result = []

    for u in users:
        order_stats = (
            db.query(
                func.count(Order.id).label("count"),
                func.coalesce(func.sum(Order.total_amount), 0.0).label("spent"),
            )
            .filter(Order.user_id == u.id)
            .first()
        )

        orders_count = order_stats.count if order_stats else 0
        total_spent = float(order_stats.spent) if order_stats else 0.0

        # Try to find recent phone from orders or shipping address
        recent_order = (
            db.query(Order)
            .filter(Order.user_id == u.id)
            .order_by(Order.created_at.desc(), Order.id.desc())
            .first()
        )

        phone = ""
        if recent_order and recent_order.shipping_address:
            try:
                parsed_addr = json.loads(recent_order.shipping_address)
                phone = parsed_addr.get("phone") or ""
            except Exception:
                pass

        result.append({
            "id": u.id,
            "name": u.name,
            "username": u.username,
            "email": u.email,
            "phone": phone,
            "role": get_user_role(db, u),
            "is_active": u.is_active,
            "orders_count": orders_count,
            "total_spent": round(total_spent, 2),
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })

    return result


# =========================================================
# USER FULL DETAILS (ORDERS, PAYMENTS, ADDRESSES)
# =========================================================

@router.get("/users/{user_id}/details")
def admin_user_details(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    # All orders placed by this user
    user_orders = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
            .joinedload(Product.brand)
        )
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc(), Order.id.desc())
        .all()
    )

    # All payment intents for this user
    payment_intents = (
        db.query(PaymentIntent)
        .filter(PaymentIntent.user_id == user_id)
        .order_by(PaymentIntent.created_at.desc())
        .all()
    )

    serialized_orders = [serialize_admin_order(o) for o in user_orders]

    # Collect unique shipping addresses
    addresses = []
    seen = set()
    for o in serialized_orders:
        addr = o.get("shipping_address")
        if isinstance(addr, dict) and addr.get("address_line1"):
            key = f"{addr.get('address_line1')}-{addr.get('city')}-{addr.get('pincode')}"
            if key not in seen:
                seen.add(key)
                addresses.append(addr)

    total_spent = sum(
        o["total_amount"]
        for o in serialized_orders
        if o.get("payment_status") in ["paid", "confirmed"]
    )
    pending_orders_count = sum(
        1 for o in serialized_orders if o.get("status") in ["pending", "processing", "confirmed"]
    )

    serialized_payments = [
        {
            "id": p.id,
            "razorpay_order_id": p.razorpay_order_id,
            "razorpay_payment_id": p.razorpay_payment_id,
            "amount": round(p.amount_paise / 100, 2),
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
        }
        for p in payment_intents
    ]

    return {
        "user": {
            "id": target_user.id,
            "name": target_user.name,
            "username": target_user.username,
            "email": target_user.email,
            "phone": addresses[0].get("phone") if addresses else "",
            "role": get_user_role(db, target_user),
            "is_active": target_user.is_active,
            "created_at": target_user.created_at.isoformat() if target_user.created_at else None,
        },
        "stats": {
            "total_orders": len(serialized_orders),
            "total_spent": round(float(total_spent), 2),
            "pending_orders": pending_orders_count,
            "total_payments": len(serialized_payments),
        },
        "orders": serialized_orders,
        "payments": serialized_payments,
        "addresses": addresses,
    }


# =========================================================
# UPDATE ROLE
# =========================================================

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: RoleUpdateRequest,
    current_admin: User = Depends(
        require_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own role.",
        )

    target_role = payload.role.strip().lower()

    if target_role not in {ROLE_CUSTOMER, ROLE_ADMIN}:
        raise HTTPException(
            status_code=400,
            detail="Role must be customer or admin.",
        )

    access = (
        db.query(UserAccess)
        .filter(UserAccess.user_id == user.id)
        .first()
    )

    if access:
        access.role = target_role
    else:
        access = UserAccess(
            user_id=user.id,
            role=target_role,
        )
        db.add(access)

    user.is_admin = (target_role == ROLE_ADMIN)

    db.commit()

    return {
        "message": "User role updated successfully.",
        "user_id": user.id,
        "username": user.username,
        "role": target_role,
    }


# =========================================================
# PRODUCTS & INVENTORY
# =========================================================

@router.get("/products")
def admin_products(
    _: User = Depends(
        require_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    products = (
        db.query(Product)
        .order_by(Product.id.asc())
        .all()
    )

    result = []

    for product in products:
        variants = product.variants or []
        total_stock = sum(v.stock for v in variants if v.stock)
        
        variant_list = [
            {
                "id": v.id,
                "sku": v.sku,
                "size": v.size,
                "color": v.color,
                "price": v.price,
                "stock": v.stock,
                "is_active": v.is_active,
            }
            for v in variants
        ]

        result.append({
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description or "",
            "department": product.department,
            "category": product.category.name if product.category else None,
            "category_id": product.category_id,
            "brand": product.brand.name if product.brand else "VESTRA",
            "brand_id": product.brand_id,
            "gender": product.gender or "",
            "base_price": product.base_price,
            "discount_percentage": product.discount_percentage,
            "image_url": product.image_url,
            "is_featured": product.is_featured,
            "is_active": product.is_active,
            "total_stock": total_stock,
            "variant_count": len(variants),
            "variants": variant_list,
        })

    return result


# =========================================================
# HELPER: SLUGIFY
# =========================================================

def slugify_product_name(text: str) -> str:
    cleaned = text.lower().strip()
    cleaned = re.sub(r"[^\w\s-]", "", cleaned)
    cleaned = re.sub(r"[\s_-]+", "-", cleaned)
    return cleaned.strip("-") or "product"


# =========================================================
# CREATE PRODUCT (WITH VARIANTS & DETAILS)
# =========================================================

@router.post("/products", status_code=status.HTTP_201_CREATED)
def admin_create_product(
    payload: AdminProductCreateRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    base_slug = slugify_product_name(payload.name)
    slug = base_slug
    counter = 1
    while db.query(Product).filter(Product.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    category_id = payload.category_id
    if not category_id and payload.category_name and payload.category_name.strip():
        cat_name = payload.category_name.strip()
        existing_cat = db.query(Category).filter(Category.name.ilike(cat_name)).first()
        if existing_cat:
            category_id = existing_cat.id
        else:
            cat_slug = slugify_product_name(cat_name)
            new_cat = Category(name=cat_name, slug=cat_slug)
            db.add(new_cat)
            db.flush()
            category_id = new_cat.id

    brand_id = payload.brand_id
    if not brand_id and payload.brand_name and payload.brand_name.strip():
        b_name = payload.brand_name.strip()
        existing_b = db.query(Brand).filter(Brand.name.ilike(b_name)).first()
        if existing_b:
            brand_id = existing_b.id
        else:
            b_slug = slugify_product_name(b_name)
            new_b = Brand(name=b_name, slug=b_slug)
            db.add(new_b)
            db.flush()
            brand_id = new_b.id

    product = Product(
        name=payload.name.strip(),
        slug=slug,
        description=payload.description or "",
        department=payload.department.strip() if payload.department else "Women",
        category_id=category_id,
        brand_id=brand_id,
        gender=payload.gender or "Women",
        base_price=round(float(payload.base_price), 2),
        discount_percentage=round(float(payload.discount_percentage or 0), 2),
        rating=4.5,
        image_url=payload.image_url or "",
        is_featured=payload.is_featured,
        is_active=payload.is_active,
    )

    db.add(product)
    db.flush()

    raw_variants = payload.variants or []
    if not raw_variants:
        raw_variants = [
            AdminProductVariantCreate(
                size="Free Size",
                color="Standard",
                price=payload.base_price,
                stock=15,
                image_url=payload.image_url,
                is_active=True,
            )
        ]

    created_variants = []
    for v in raw_variants:
        variant_sku = (v.sku or "").strip()
        if not variant_sku:
            variant_sku = f"VES-{slug[:8].upper()}-{(v.size or 'FS')[:3].upper()}-{uuid.uuid4().hex[:6].upper()}"

        variant_price = (
            round(float(v.price), 2)
            if v.price is not None and v.price > 0
            else round(float(payload.base_price), 2)
        )

        variant = ProductVariant(
            product_id=product.id,
            sku=variant_sku,
            size=v.size or "Free Size",
            color=v.color or "Standard",
            price=variant_price,
            stock=max(0, int(v.stock)),
            image_url=v.image_url or payload.image_url or "",
            is_active=v.is_active,
        )
        db.add(variant)
        created_variants.append(variant)

    db.commit()
    db.refresh(product)

    return {
        "message": "Product and variants created successfully.",
        "product": {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "department": product.department,
            "category": product.category.name if product.category else None,
            "brand": product.brand.name if product.brand else "VESTRA",
            "base_price": product.base_price,
            "discount_percentage": product.discount_percentage,
            "image_url": product.image_url,
            "is_active": product.is_active,
            "is_featured": product.is_featured,
            "total_stock": sum(v.stock for v in created_variants),
            "variant_count": len(created_variants),
            "variants": [
                {
                    "id": v.id,
                    "sku": v.sku,
                    "size": v.size,
                    "color": v.color,
                    "price": v.price,
                    "stock": v.stock,
                    "is_active": v.is_active,
                }
                for v in created_variants
            ],
        },
    }


# =========================================================
# UPDATE PRODUCT DETAILS
# =========================================================

@router.put("/products/{product_id}")
def admin_update_product(
    product_id: int,
    payload: AdminProductUpdateRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if payload.name is not None and payload.name.strip():
        product.name = payload.name.strip()
    if payload.description is not None:
        product.description = payload.description
    if payload.department is not None and payload.department.strip():
        product.department = payload.department.strip()
    if payload.category_id is not None:
        product.category_id = payload.category_id
    if payload.brand_id is not None:
        product.brand_id = payload.brand_id
    if payload.gender is not None:
        product.gender = payload.gender
    if payload.base_price is not None:
        product.base_price = round(float(payload.base_price), 2)
    if payload.discount_percentage is not None:
        product.discount_percentage = round(float(payload.discount_percentage), 2)
    if payload.image_url is not None:
        product.image_url = payload.image_url
    if payload.is_featured is not None:
        product.is_featured = payload.is_featured
    if payload.is_active is not None:
        product.is_active = payload.is_active

    db.commit()
    db.refresh(product)

    return {
        "message": "Product updated successfully.",
        "product_id": product.id,
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@router.delete("/products/{product_id}")
def admin_delete_product(
    product_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    product_name = product.name
    db.delete(product)
    db.commit()

    return {
        "message": f"Product '{product_name}' deleted successfully.",
        "product_id": product_id,
    }


# =========================================================
# ADD VARIANT TO PRODUCT
# =========================================================

@router.post("/products/{product_id}/variants", status_code=status.HTTP_201_CREATED)
def admin_add_variant_to_product(
    product_id: int,
    payload: AdminProductVariantCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    variant_sku = (payload.sku or "").strip()
    if not variant_sku:
        variant_sku = f"VES-{product.slug[:8].upper()}-{(payload.size or 'FS')[:3].upper()}-{uuid.uuid4().hex[:6].upper()}"

    price = (
        round(float(payload.price), 2)
        if payload.price is not None and payload.price > 0
        else round(float(product.base_price), 2)
    )

    variant = ProductVariant(
        product_id=product.id,
        sku=variant_sku,
        size=payload.size or "Free Size",
        color=payload.color or "Standard",
        price=price,
        stock=max(0, int(payload.stock)),
        image_url=payload.image_url or product.image_url or "",
        is_active=payload.is_active,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)

    return {
        "message": "Variant added successfully.",
        "variant": {
            "id": variant.id,
            "sku": variant.sku,
            "size": variant.size,
            "color": variant.color,
            "price": variant.price,
            "stock": variant.stock,
            "is_active": variant.is_active,
        },
    }


# =========================================================
# TOGGLE PRODUCT ACTIVE STATUS
# =========================================================

@router.patch("/products/{product_id}/toggle-active")
def toggle_product_active(
    product_id: int,
    _: User = Depends(
        require_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    product.is_active = not product.is_active
    db.commit()

    return {
        "message": f"Product is now {'active' if product.is_active else 'inactive'}.",
        "product_id": product.id,
        "is_active": product.is_active,
    }


# =========================================================
# UPDATE VARIANT (PRICE / STOCK / STATUS)
# =========================================================

@router.put("/variants/{variant_id}")
def admin_update_variant(
    variant_id: int,
    payload: AdminVariantUpdateRequest,
    _: User = Depends(
        require_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    variant = (
        db.query(ProductVariant)
        .filter(ProductVariant.id == variant_id)
        .first()
    )

    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Variant not found.",
        )

    if payload.price is not None:
        variant.price = payload.price

    if payload.stock is not None:
        variant.stock = payload.stock

    if payload.is_active is not None:
        variant.is_active = payload.is_active

    db.commit()
    db.refresh(variant)

    return {
        "message": "Variant updated successfully.",
        "variant": {
            "id": variant.id,
            "sku": variant.sku,
            "size": variant.size,
            "price": variant.price,
            "stock": variant.stock,
            "is_active": variant.is_active,
        },
    }


# =========================================================
# SERIALIZE ADMIN ORDER HELPER
# =========================================================

def serialize_admin_order(order: Order):
    items = []
    for item in (order.items or []):
        variant = item.variant
        product = variant.product if variant else None
        brand = product.brand if product else None

        items.append({
            "id": item.id,
            "product_id": product.id if product else None,
            "variant_id": item.variant_id,
            "product_name": item.product_name,
            "brand": brand.name if brand else "Apsara Trends",
            "image_url": (
                variant.image_url
                if variant and variant.image_url
                else (product.image_url if product else None)
            ),
            "size": item.size,
            "color": item.color,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "line_total": round(float(item.unit_price or 0) * int(item.quantity or 1), 2),
        })

    shipping_info = {}
    if order.shipping_address:
        try:
            shipping_info = json.loads(order.shipping_address)
        except Exception:
            shipping_info = {"raw": order.shipping_address}

    customer_user = order.user
    customer = {
        "id": customer_user.id if customer_user else order.user_id,
        "name": customer_user.name if customer_user else (shipping_info.get("name") or "Guest Customer"),
        "email": customer_user.email if customer_user else None,
        "username": customer_user.username if customer_user else None,
        "phone": shipping_info.get("phone") or "",
    }

    events = []
    if order.tracking_events:
        try:
            events = json.loads(order.tracking_events)
            if not isinstance(events, list):
                events = []
        except Exception:
            events = []

    status_lower = (order.status or "confirmed").lower()
    milestone_map = {"confirmed": 0, "processing": 1, "shipped": 2, "out_for_delivery": 3, "delivered": 4}
    percent_map = {"confirmed": 20, "processing": 45, "shipped": 70, "out_for_delivery": 90, "delivered": 100, "cancelled": 0}

    return {
        "id": order.id,
        "user_id": order.user_id,
        "customer": customer,
        "total_amount": round(float(order.total_amount or 0), 2),
        "status": order.status,
        "payment_status": order.payment_status,
        "shipping_address": shipping_info,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "tracking_number": order.tracking_number,
        "courier_name": order.courier_name or "Apsara Express Priority Logistics",
        "current_location": order.current_location or "Apsara Central Fulfilment Hub, Mumbai",
        "estimated_delivery": order.estimated_delivery,
        "tracking_events": sorted(events, key=lambda e: e.get("timestamp", ""), reverse=True),
        "milestone_index": milestone_map.get(status_lower, 0),
        "progress_percent": percent_map.get(status_lower, 20),
        "items": items,
        "items_count": sum(it.get("quantity", 1) for it in items),
    }


# =========================================================
# ADMIN ORDERS - LIST
# =========================================================

@router.get("/orders")
def admin_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
            .joinedload(Product.brand)
        )
        .order_by(Order.created_at.desc(), Order.id.desc())
    )

    if status and status.lower() != "all":
        query = query.filter(Order.status == status.lower())

    orders = query.all()

    if search and search.strip():
        q = search.strip().lower()
        filtered = []
        for o in orders:
            order_id_str = f"#{o.id}"
            user_name = (o.user.name or "").lower() if o.user else ""
            user_email = (o.user.email or "").lower() if o.user else ""
            tracking_num = (o.tracking_number or "").lower()
            item_match = any(q in (it.product_name or "").lower() for it in (o.items or []))
            if (q in str(o.id) or q in order_id_str or q in user_name or q in user_email or q in tracking_num or item_match):
                filtered.append(o)
        orders = filtered

    return [serialize_admin_order(o) for o in orders]


# =========================================================
# ADMIN ORDERS - UPDATE STATUS
# =========================================================

@router.patch("/orders/{order_id}/status")
def update_admin_order_status(
    order_id: int,
    payload: AdminOrderStatusUpdateRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
        )
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    if not order.tracking_number or not order.tracking_events:
        initialize_order_tracking_fields(order)

    status_changed = False
    if payload.status is not None and payload.status.strip():
        new_status = payload.status.strip().lower()
        if new_status != order.status:
            order.status = new_status
            status_changed = True

    if payload.payment_status is not None and payload.payment_status.strip():
        order.payment_status = payload.payment_status.strip().lower()

    if status_changed:
        status_event_map = {
            "confirmed": ("Order Confirmed", "Order confirmed by Apsara Trends administration.", order.current_location),
            "processing": ("Packed & Quality Checked", "Order inspected and packed with Apsara security seal.", order.current_location),
            "shipped": ("Dispatched with Courier", f"Dispatched via {order.courier_name} (AWB: {order.tracking_number}).", order.current_location),
            "out_for_delivery": ("Out for Delivery", "Courier executive is out for delivery to destination address.", order.current_location),
            "delivered": ("Order Delivered", "Shipment handed over safely to the recipient.", "Destination Address"),
            "cancelled": ("Order Cancelled", "Order was cancelled. Refund processed if applicable.", "Customer Care Center"),
        }
        if order.status in status_event_map:
            title, desc, loc = status_event_map[order.status]
            append_tracking_event(order, order.status, title, desc, loc)

    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully.",
        "order": serialize_admin_order(order),
    }


# =========================================================
# ADMIN ORDERS - UPDATE TRACKING & SHIPMENT
# =========================================================

@router.patch("/orders/{order_id}/tracking")
def update_admin_order_tracking(
    order_id: int,
    payload: AdminOrderTrackingUpdateRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
        )
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    if not order.tracking_number or not order.tracking_events:
        initialize_order_tracking_fields(order)

    if payload.courier_name is not None and payload.courier_name.strip():
        order.courier_name = payload.courier_name.strip()

    if payload.tracking_number is not None and payload.tracking_number.strip():
        order.tracking_number = payload.tracking_number.strip()

    if payload.current_location is not None and payload.current_location.strip():
        order.current_location = payload.current_location.strip()

    if payload.estimated_delivery is not None and payload.estimated_delivery.strip():
        order.estimated_delivery = payload.estimated_delivery.strip()

    status_changed = False
    if payload.status is not None and payload.status.strip():
        new_status = payload.status.strip().lower()
        if new_status != order.status:
            order.status = new_status
            status_changed = True

    if payload.payment_status is not None and payload.payment_status.strip():
        order.payment_status = payload.payment_status.strip().lower()

    if payload.checkpoint_title and payload.checkpoint_title.strip():
        append_tracking_event(
            order,
            status_key=order.status or "in_transit",
            title=payload.checkpoint_title.strip(),
            description=payload.checkpoint_description.strip() if payload.checkpoint_description else f"Status updated at {order.current_location}.",
            location=order.current_location,
        )
    elif status_changed:
        status_event_map = {
            "confirmed": ("Order Confirmed", "Order confirmed by Apsara Trends administration.", order.current_location),
            "processing": ("Packed & Quality Checked", "Order inspected and packed with Apsara security seal.", order.current_location),
            "shipped": ("Dispatched with Courier", f"Dispatched via {order.courier_name} (AWB: {order.tracking_number}).", order.current_location),
            "out_for_delivery": ("Out for Delivery", "Courier executive is out for delivery to destination address.", order.current_location),
            "delivered": ("Order Delivered", "Shipment handed over safely to the recipient.", "Destination Address"),
            "cancelled": ("Order Cancelled", "Order was cancelled. Refund processed if applicable.", "Customer Care Center"),
        }
        if order.status in status_event_map:
            title, desc, loc = status_event_map[order.status]
            append_tracking_event(order, order.status, title, desc, loc)

    db.commit()
    db.refresh(order)

    return {
        "message": "Order tracking telemetry updated successfully.",
        "order": serialize_admin_order(order),
        "tracking": build_tracking_payload(order),
    }