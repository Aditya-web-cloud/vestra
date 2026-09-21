import json
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pydantic import BaseModel, Field

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from auth import get_current_user
from database import get_db

from models import (
    Order,
    OrderItem,
    Product,
    ProductVariant,
    User,
)

from order_tracking import (
    initialize_order_tracking_fields,
    build_tracking_payload,
    append_tracking_event,
)


class DirectOrderItemInput(BaseModel):
    variant_id: int
    quantity: int = Field(default=1, ge=1)


class DirectOrderCreateRequest(BaseModel):
    items: List[DirectOrderItemInput]
    shipping_address: Dict[str, Any]
    payment_method: Optional[str] = "cod"


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


# =========================================================
# SERIALIZE ORDER
# =========================================================

def serialize_order(
    order: Order,
):

    items = []


    for item in order.items:

        variant = item.variant

        product = (
            variant.product
            if variant
            else None
        )

        brand = (
            product.brand
            if product
            else None
        )


        items.append({
            "id":
                item.id,

            "product_id":
                product.id
                if product
                else None,

            "variant_id":
                item.variant_id,

            "product_name":
                item.product_name,

            "brand":
                brand.name
                if brand
                else "Apsara Trends",

            "image_url":
                (
                    variant.image_url
                    if variant
                    and variant.image_url
                    else (
                        product.image_url
                        if product
                        else None
                    )
                ),

            "size":
                item.size,

            "color":
                item.color,

            "quantity":
                item.quantity,

            "unit_price":
                item.unit_price,

            "line_total":
                round(
                    float(
                        item.unit_price
                    )
                    *
                    int(
                        item.quantity
                    ),
                    2,
                ),
        })


    return {
        "id":
            order.id,

        "user_id":
            order.user_id,

        "total_amount":
            order.total_amount,

        "status":
            order.status,

        "payment_status":
            order.payment_status,

        "shipping_address":
            order.shipping_address,

        "tracking_number":
            order.tracking_number,

        "courier_name":
            order.courier_name or "Apsara Express Priority Logistics",

        "current_location":
            order.current_location or "Apsara Central Fulfilment Hub, Mumbai",

        "estimated_delivery":
            order.estimated_delivery,

        "created_at":
            order.created_at,

        "items":
            items,
    }


# =========================================================
# MY ORDERS
# =========================================================

@router.get("/my")
def my_orders(
    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
        )
        .filter(
            Order.user_id ==
            current_user.id
        )
        .order_by(
            Order.created_at.desc(),
            Order.id.desc(),
        )
        .all()
    )


    return [
        serialize_order(
            order
        )

        for order
        in orders
    ]


# =========================================================
# SINGLE ORDER
# =========================================================

@router.get("/{order_id}")
def my_order_detail(
    order_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    order = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
        )
        .filter(
            Order.id ==
            order_id,

            Order.user_id ==
            current_user.id,
        )
        .first()
    )


    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )


    return serialize_order(
        order
    )


# =========================================================
# REAL-TIME ORDER TRACKING TELEMETRY
# =========================================================

@router.get("/{order_id}/tracking")
def get_order_tracking(
    order_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
        )
        .filter(
            Order.id == order_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    if order.user_id != current_user.id and not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to view tracking for this order.",
        )

    if not order.tracking_number or not order.tracking_events:
        initialize_order_tracking_fields(order)
        db.commit()

    return build_tracking_payload(order)


@router.get("/track/{identifier}")
def public_track_order(
    identifier: str,
    db: Session = Depends(
        get_db
    ),
):
    clean_id = identifier.strip()
    query = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
        )
    )

    order = query.filter(Order.tracking_number == clean_id).first()
    if not order and clean_id.isdigit():
        order = query.filter(Order.id == int(clean_id)).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="No shipment found for this tracking number or order ID.",
        )

    if not order.tracking_number or not order.tracking_events:
        initialize_order_tracking_fields(order)
        db.commit()

    return build_tracking_payload(order)


# =========================================================
# CREATE DIRECT / COD ORDER
# =========================================================

@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: DirectOrderCreateRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    if not payload.items:
        raise HTTPException(
            status_code=400,
            detail="Order items cannot be empty.",
        )

    if not payload.shipping_address:
        raise HTTPException(
            status_code=400,
            detail="Delivery address is required.",
        )

    quantities = {}
    for item in payload.items:
        vid = int(item.variant_id)
        quantities[vid] = quantities.get(vid, 0) + int(item.quantity)

    variants = (
        db.query(ProductVariant)
        .options(
            joinedload(ProductVariant.product)
        )
        .filter(ProductVariant.id.in_(list(quantities.keys())))
        .all()
    )

    if len(variants) != len(quantities):
        raise HTTPException(
            status_code=400,
            detail="One or more selected products are invalid or no longer exist.",
        )

    variant_map = {v.id: v for v in variants}
    total_amount = 0.0

    for vid, qty in quantities.items():
        variant = variant_map[vid]
        if not variant.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"{variant.product.name} is currently unavailable.",
            )
        if variant.stock < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {variant.product.name} ({variant.size or 'Free Size'}). Only {variant.stock} available.",
            )
        total_amount += float(variant.price or 0.0) * qty

    payment_method = (payload.payment_method or "cod").strip().lower()

    order = Order(
        user_id=current_user.id,
        total_amount=round(total_amount, 2),
        status="confirmed",
        payment_status="paid" if payment_method in ["online", "prepaid"] else "pending",
        shipping_address=json.dumps(payload.shipping_address, ensure_ascii=False),
    )

    initialize_order_tracking_fields(order)

    db.add(order)
    db.flush()

    for vid, qty in quantities.items():
        variant = variant_map[vid]
        variant.stock = max(0, variant.stock - qty)

        product = variant.product
        order_item = OrderItem(
            order_id=order.id,
            variant_id=vid,
            product_name=str(product.name if product else "Apsara Trends Product"),
            size=str(variant.size or ""),
            color=str(variant.color or ""),
            quantity=qty,
            unit_price=float(variant.price or 0.0),
        )
        db.add(order_item)

    db.commit()

    full_order = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
        )
        .filter(Order.id == order.id)
        .first()
    )

    return serialize_order(full_order)