from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from database import Base


class PaymentIntent(Base):
    __tablename__ = "payment_intents"

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

    razorpay_order_id = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    razorpay_payment_id = Column(
        String(100),
        nullable=True,
        unique=True,
        index=True,
    )

    amount_paise = Column(
        Integer,
        nullable=False,
    )

    currency = Column(
        String(10),
        nullable=False,
        default="INR",
    )

    status = Column(
        String(30),
        nullable=False,
        default="created",
        index=True,
    )

    cart_json = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    paid_at = Column(
        DateTime,
        nullable=True,
    )