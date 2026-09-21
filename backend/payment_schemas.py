from typing import (
    Any,
    Dict,
    List,
    Optional,
)

from pydantic import (
    BaseModel,
    Field,
)


# =========================================================
# CART ITEM
# =========================================================

class PaymentCartItem(BaseModel):

    variant_id: int

    quantity: int = Field(
        ge=1,
        le=10,
    )


# =========================================================
# CREATE RAZORPAY ORDER
# =========================================================

class CreatePaymentOrderRequest(BaseModel):

    items: List[PaymentCartItem]

    shipping_address: Dict[str, Any]


# =========================================================
# VERIFY RAZORPAY PAYMENT
# =========================================================

class VerifyPaymentRequest(BaseModel):

    razorpay_order_id: Optional[str] = None

    razorpay_payment_id: Optional[str] = None

    razorpay_signature: Optional[str] = None