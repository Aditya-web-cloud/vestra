import hashlib
import hmac
import json
import os

from datetime import datetime

from decimal import (
    Decimal,
    ROUND_HALF_UP,
)

from pathlib import Path

from uuid import uuid4


import razorpay

from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session


from auth import (
    get_current_user,
)

from database import (
    get_db,
)

from models import (
    Order,
    OrderItem,
    Product,
    ProductVariant,
    User,
)

from order_tracking import (
    initialize_order_tracking_fields,
)

from payment_models import (
    PaymentIntent,
)

from payment_schemas import (
    CreatePaymentOrderRequest,
    VerifyPaymentRequest,
)


# =========================================================
# ENV
# =========================================================

ENV_PATH = (
    Path(__file__)
    .resolve()
    .parent
    /
    ".env"
)


load_dotenv(
    ENV_PATH,
    override=True,
)


RAZORPAY_KEY_ID = (
    os.getenv(
        "RAZORPAY_KEY_ID",
        "rzp_test_TWgbh1ZXPMo4pl",
    )
    .strip()
)


RAZORPAY_KEY_SECRET = (
    os.getenv(
        "RAZORPAY_KEY_SECRET",
        "3V9I3xWuBc56nFbhH4yOD4Ej",
    )
    .strip()
)



CURRENCY = "INR"


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


# =========================================================
# CONFIG
# =========================================================

def ensure_razorpay_config():

    if (
        not RAZORPAY_KEY_ID
        or
        not RAZORPAY_KEY_SECRET
    ):

        raise HTTPException(
            status_code=
                status.HTTP_503_SERVICE_UNAVAILABLE,

            detail=(
                "Razorpay credentials "
                "are not configured."
            ),
        )


def get_razorpay_client():

    ensure_razorpay_config()


    return razorpay.Client(
        auth=(
            RAZORPAY_KEY_ID,
            RAZORPAY_KEY_SECRET,
        )
    )


# =========================================================
# AUTH ERROR CHECK
# =========================================================

def is_authentication_error(
    exc: Exception,
):

    message = str(
        exc
    ).lower()


    indicators = (
        "authentication",
        "invalid api key",
        "api key provided is invalid",
        "unauthorized",
        "invalid key",
    )


    return any(
        indicator in message
        for indicator
        in indicators
    )


# =========================================================
# PAYMENT CONFIG
# =========================================================

@router.get("/config")
def payment_config():

    ensure_razorpay_config()


    return {
        "key_id":
            RAZORPAY_KEY_ID,

        "currency":
            CURRENCY,

        "environment":
            os.getenv(
                "VESTRA_ENV",
                "development",
            ),
    }


# =========================================================
# CREATE RAZORPAY ORDER
# =========================================================

@router.post("/create-order")
def create_payment_order(
    payload:
        CreatePaymentOrderRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    # -----------------------------------------------------
    # BAG
    # -----------------------------------------------------

    if not payload.items:

        raise HTTPException(
            status_code=400,
            detail="Your bag is empty.",
        )


    # -----------------------------------------------------
    # ADDRESS
    # -----------------------------------------------------

    if not payload.shipping_address:

        raise HTTPException(
            status_code=400,
            detail=(
                "A delivery address "
                "is required."
            ),
        )


    # -----------------------------------------------------
    # MERGE DUPLICATE VARIANTS
    # -----------------------------------------------------

    quantities = {}


    for item in payload.items:

        quantities[
            item.variant_id
        ] = (
            quantities.get(
                item.variant_id,
                0,
            )
            +
            item.quantity
        )


    for quantity in quantities.values():

        if quantity > 10:

            raise HTTPException(
                status_code=400,

                detail=(
                    "Maximum quantity per "
                    "variant is 10."
                ),
            )


    variant_ids = list(
        quantities.keys()
    )


    # -----------------------------------------------------
    # VARIANTS
    # -----------------------------------------------------

    variants = (
        db.query(
            ProductVariant
        )
        .filter(
            ProductVariant.id.in_(
                variant_ids
            )
        )
        .all()
    )


    variant_map = {
        variant.id:
            variant

        for variant
        in variants
    }


    if (
        len(variant_map)
        !=
        len(variant_ids)
    ):

        raise HTTPException(
            status_code=400,

            detail=(
                "One or more items "
                "no longer exist."
            ),
        )


    # -----------------------------------------------------
    # PRODUCTS
    # -----------------------------------------------------

    product_ids = list({
        variant.product_id
        for variant
        in variants
    })


    products = (
        db.query(Product)
        .filter(
            Product.id.in_(
                product_ids
            )
        )
        .all()
    )


    product_map = {
        product.id:
            product

        for product
        in products
    }


    # -----------------------------------------------------
    # PRICE CALCULATION
    # -----------------------------------------------------

    total_rupees = Decimal(
        "0.00"
    )


    cart_snapshot = []


    for (
        variant_id,
        quantity
    ) in quantities.items():

        variant = (
            variant_map[
                variant_id
            ]
        )


        product = (
            product_map.get(
                variant.product_id
            )
        )


        if not product:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Product not found."
                ),
            )


        if not product.is_active:

            raise HTTPException(
                status_code=400,

                detail=(
                    f"{product.name} "
                    "is unavailable."
                ),
            )


        if not variant.is_active:

            raise HTTPException(
                status_code=400,

                detail=(
                    f"{product.name} "
                    "variant is unavailable."
                ),
            )


        stock = int(
            variant.stock
            or
            0
        )


        if stock < quantity:

            raise HTTPException(
                status_code=400,

                detail=(
                    f"Only {stock} unit(s) "
                    f"of {product.name} "
                    "are available."
                ),
            )


        unit_price = Decimal(
            str(
                variant.price
            )
        )


        if unit_price <= 0:

            raise HTTPException(
                status_code=400,

                detail=(
                    f"Invalid price for "
                    f"{product.name}."
                ),
            )


        line_total = (
            unit_price
            *
            Decimal(
                quantity
            )
        )


        total_rupees += (
            line_total
        )


        cart_snapshot.append({
            "product_id":
                product.id,

            "variant_id":
                variant.id,

            "product_name":
                product.name,

            "sku":
                variant.sku,

            "size":
                variant.size or "",

            "color":
                variant.color or "",

            "quantity":
                quantity,

            "unit_price":
                str(
                    unit_price
                ),

            "line_total":
                str(
                    line_total
                ),
        })


    # -----------------------------------------------------
    # RUPEES -> PAISE
    # -----------------------------------------------------

    amount_paise = int(
        (
            total_rupees
            *
            Decimal("100")
        )
        .quantize(
            Decimal("1"),
            rounding=
                ROUND_HALF_UP,
        )
    )


    if amount_paise < 100:

        raise HTTPException(
            status_code=400,
            detail=(
                "Payment amount must "
                "be at least ₹1."
            ),
        )


    # -----------------------------------------------------
    # RAZORPAY ORDER
    # -----------------------------------------------------

    client = (
        get_razorpay_client()
    )


    receipt = (
        f"vestra_{current_user.id}_"
        f"{uuid4().hex[:18]}"
    )


    try:

        razorpay_order = (
            client.order.create(
                data={
                    "amount":
                        amount_paise,

                    "currency":
                        CURRENCY,

                    "receipt":
                        receipt,
                }
            )
        )


    except Exception as exc:

        print(
            "Razorpay order error:",
            exc,
        )


        if is_authentication_error(
            exc
        ):

            raise HTTPException(
                status_code=401,

                detail=(
                    "Razorpay authentication "
                    "failed."
                ),
            )


        raise HTTPException(
            status_code=500,

            detail=(
                "Unable to create "
                "Razorpay order."
            ),
        )


    razorpay_order_id = (
        razorpay_order.get(
            "id"
        )
    )


    if not razorpay_order_id:

        raise HTTPException(
            status_code=500,

            detail=(
                "Razorpay did not "
                "return an order ID."
            ),
        )


    # -----------------------------------------------------
    # PAYMENT SNAPSHOT
    # -----------------------------------------------------

    snapshot = {
        "items":
            cart_snapshot,

        "shipping_address":
            payload.shipping_address,
    }


    intent = PaymentIntent(
        user_id=
            current_user.id,

        razorpay_order_id=
            razorpay_order_id,

        amount_paise=
            amount_paise,

        currency=
            CURRENCY,

        status=
            "created",

        cart_json=
            json.dumps(
                snapshot
            ),
    )


    db.add(
        intent
    )


    db.commit()


    db.refresh(
        intent
    )


    return {
        "order_id":
            razorpay_order_id,

        "amount":
            amount_paise,

        "currency":
            CURRENCY,

        "payment_intent_id":
            intent.id,
    }


# =========================================================
# VERIFY + CREATE VESTRA ORDER
# =========================================================

@router.post("/verify")
def verify_payment(
    payload:
        VerifyPaymentRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    # -----------------------------------------------------
    # REQUIRED VALUES
    # -----------------------------------------------------

    if (
        not payload.razorpay_order_id
        or
        not payload.razorpay_payment_id
        or
        not payload.razorpay_signature
    ):

        raise HTTPException(
            status_code=400,

            detail=(
                "Payment verification "
                "information is incomplete."
            ),
        )


    ensure_razorpay_config()


    # -----------------------------------------------------
    # OUR PAYMENT INTENT
    # -----------------------------------------------------

    intent = (
        db.query(
            PaymentIntent
        )
        .filter(
            PaymentIntent.razorpay_order_id
            ==
            payload.razorpay_order_id,

            PaymentIntent.user_id
            ==
            current_user.id,
        )
        .first()
    )


    if not intent:

        raise HTTPException(
            status_code=400,
            detail="Unknown payment order.",
        )


    # -----------------------------------------------------
    # IDEMPOTENCY
    # -----------------------------------------------------

    if (
        intent.vestra_order_id
        and
        intent.status
        in {
            "verified",
            "paid",
        }
    ):

        existing_order = (
            db.query(Order)
            .filter(
                Order.id ==
                intent.vestra_order_id
            )
            .first()
        )


        if existing_order:

            return {
                "success": True,

                "message":
                    "Payment already processed.",

                "order_id":
                    intent.razorpay_order_id,

                "payment_id":
                    intent.razorpay_payment_id,

                "vestra_order_id":
                    existing_order.id,

                "amount":
                    intent.amount_paise,

                "currency":
                    intent.currency,
            }


    # -----------------------------------------------------
    # HMAC-SHA256
    # -----------------------------------------------------

    signed_data = (
        f"{intent.razorpay_order_id}"
        f"|"
        f"{payload.razorpay_payment_id}"
    )


    generated_signature = (
        hmac.new(
            RAZORPAY_KEY_SECRET.encode(
                "utf-8"
            ),

            signed_data.encode(
                "utf-8"
            ),

            hashlib.sha256,
        )
        .hexdigest()
    )


    if not hmac.compare_digest(
        generated_signature,
        payload.razorpay_signature,
    ):

        intent.status = (
            "verification_failed"
        )


        db.commit()


        raise HTTPException(
            status_code=400,

            detail=(
                "Payment signature "
                "verification failed."
            ),
        )


    # -----------------------------------------------------
    # READ STORED SNAPSHOT
    # -----------------------------------------------------

    try:

        snapshot = json.loads(
            intent.cart_json
        )


    except Exception:

        raise HTTPException(
            status_code=500,
            detail=(
                "Stored payment cart "
                "is invalid."
            ),
        )


    # Compatibility with earlier test intents.

    if isinstance(
        snapshot,
        list,
    ):

        items = snapshot

        shipping_address = {}


    else:

        items = snapshot.get(
            "items",
            [],
        )

        shipping_address = snapshot.get(
            "shipping_address",
            {},
        )


    if not items:

        raise HTTPException(
            status_code=500,
            detail=(
                "Payment has no stored "
                "order items."
            ),
        )


    # -----------------------------------------------------
    # CREATE ORDER + DECREMENT STOCK
    # -----------------------------------------------------

    try:

        order = Order(
            user_id=
                current_user.id,

            total_amount=
                intent.amount_paise
                /
                100,

            status=
                "confirmed",

            payment_status=
                "paid",

            shipping_address=
                json.dumps(
                    shipping_address,
                    ensure_ascii=False,
                ),
        )

        initialize_order_tracking_fields(order)

        db.add(
            order
        )


        # Gives us order.id without committing.
        db.flush()


        for item in items:

            variant_id = int(
                item[
                    "variant_id"
                ]
            )


            quantity = int(
                item[
                    "quantity"
                ]
            )


            # ---------------------------------------------
            # Atomic stock update:
            # only succeeds when enough stock exists.
            # ---------------------------------------------

            rows_updated = (
                db.query(
                    ProductVariant
                )
                .filter(
                    ProductVariant.id ==
                    variant_id,

                    ProductVariant.is_active.is_(
                        True
                    ),

                    ProductVariant.stock >=
                    quantity,
                )
                .update(
                    {
                        ProductVariant.stock:
                            ProductVariant.stock
                            -
                            quantity
                    },

                    synchronize_session=False,
                )
            )


            if rows_updated != 1:

                raise RuntimeError(
                    "STOCK_CHANGED"
                )


            order_item = OrderItem(
                order_id=
                    order.id,

                variant_id=
                    variant_id,

                product_name=
                    str(
                        item.get(
                            "product_name",
                            "VESTRA Product",
                        )
                    ),

                size=
                    str(
                        item.get(
                            "size",
                            "",
                        )
                        or
                        ""
                    ),

                color=
                    str(
                        item.get(
                            "color",
                            "",
                        )
                        or
                        ""
                    ),

                quantity=
                    quantity,

                unit_price=
                    float(
                        item[
                            "unit_price"
                        ]
                    ),
            )


            db.add(
                order_item
            )


        # ---------------------------------------------
        # PAYMENT LINK
        # ---------------------------------------------

        intent.status = (
            "verified"
        )


        intent.razorpay_payment_id = (
            payload.razorpay_payment_id
        )


        intent.paid_at = (
            datetime.utcnow()
        )


        intent.vestra_order_id = (
            order.id
        )


        db.commit()


        db.refresh(
            order
        )


    except RuntimeError as exc:

        db.rollback()


        if str(exc) == "STOCK_CHANGED":

            # Payment is genuine, so record that fact
            # even though fulfillment needs attention.

            intent = (
                db.query(
                    PaymentIntent
                )
                .filter(
                    PaymentIntent.id ==
                    intent.id
                )
                .first()
            )


            intent.status = (
                "paid_stock_issue"
            )


            intent.razorpay_payment_id = (
                payload.razorpay_payment_id
            )


            intent.paid_at = (
                datetime.utcnow()
            )


            db.commit()


            raise HTTPException(
                status_code=409,

                detail=(
                    "Payment was verified, "
                    "but stock changed before "
                    "the order could be fulfilled. "
                    "The payment has been recorded "
                    "for manual resolution."
                ),
            )


        raise


    except Exception as exc:

        db.rollback()


        print(
            "VESTRA order creation error:",
            exc,
        )


        raise HTTPException(
            status_code=500,

            detail=(
                "Payment was verified but "
                "the VESTRA order could not "
                "be created."
            ),
        )


    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    return {
        "success": True,

        "message":
            "Payment verified and "
            "order created.",

        "vestra_order_id":
            order.id,

        "order_id":
            intent.razorpay_order_id,

        "payment_id":
            intent.razorpay_payment_id,

        "amount":
            intent.amount_paise,

        "currency":
            intent.currency,
    }