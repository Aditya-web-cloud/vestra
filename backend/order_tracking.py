from datetime import datetime, timedelta
import json
import random
from typing import Any, Dict, List, Optional

from models import Order


DEFAULT_COURIER = "Apsara Express Priority Logistics"
DEFAULT_LOCATION = "Apsara Central Fulfilment Hub, Mumbai"


def generate_tracking_number(order_id: Optional[int] = None) -> str:
    seed = random.randint(100000, 999999)
    if order_id:
        return f"APS-EXP-{order_id:04d}-{seed % 1000:03d}"
    return f"APS-EXP-{seed}"


def calculate_estimated_delivery(created_at: Optional[datetime] = None) -> str:
    base = created_at or datetime.utcnow()
    est = base + timedelta(days=4)
    return est.strftime("%a, %d %b %Y")


def initialize_order_tracking_fields(order: Order):
    """Initializes tracking number, courier, location, delivery date, and initial checkpoint."""
    if not order.tracking_number:
        order.tracking_number = generate_tracking_number(order.id)
    if not order.courier_name:
        order.courier_name = DEFAULT_COURIER
    if not order.current_location:
        order.current_location = DEFAULT_LOCATION
    if not order.estimated_delivery:
        order.estimated_delivery = calculate_estimated_delivery(order.created_at)

    if not order.tracking_events:
        now_iso = (order.created_at or datetime.utcnow()).isoformat()
        initial_events = [
            {
                "status": "confirmed",
                "title": "Order Placed & Confirmed",
                "description": "Your order has been verified and confirmed. Inventory is reserved for packing.",
                "location": order.current_location,
                "timestamp": now_iso,
            }
        ]
        order.tracking_events = json.dumps(initial_events)


def append_tracking_event(
    order: Order,
    status_key: str,
    title: str,
    description: str,
    location: Optional[str] = None,
):
    """Appends a new tracking checkpoint to an order."""
    events: List[Dict[str, Any]] = []
    if order.tracking_events:
        try:
            events = json.loads(order.tracking_events)
            if not isinstance(events, list):
                events = []
        except Exception:
            events = []

    loc = location or order.current_location or DEFAULT_LOCATION
    events.append({
        "status": status_key,
        "title": title,
        "description": description,
        "location": loc,
        "timestamp": datetime.utcnow().isoformat(),
    })

    order.tracking_events = json.dumps(events)
    if location:
        order.current_location = location


def build_tracking_payload(order: Order) -> Dict[str, Any]:
    """Builds comprehensive real-time tracking telemetry for customer and staff views."""
    events: List[Dict[str, Any]] = []
    if order.tracking_events:
        try:
            events = json.loads(order.tracking_events)
            if not isinstance(events, list):
                events = []
        except Exception:
            events = []

    created_iso = order.created_at.isoformat() if order.created_at else datetime.utcnow().isoformat()
    status_lower = (order.status or "confirmed").lower()

    # Fallback synthetic events if none recorded
    if not events:
        events.append({
            "status": "confirmed",
            "title": "Order Placed & Confirmed",
            "description": "Your order has been verified and confirmed.",
            "location": order.current_location or DEFAULT_LOCATION,
            "timestamp": created_iso,
        })
        if status_lower in ["processing", "shipped", "out_for_delivery", "delivered"]:
            events.append({
                "status": "processing",
                "title": "Packed & Quality Checked",
                "description": "Items packed in Apsara Trends signature royal packaging with security seal.",
                "location": "Apsara Central Fulfilment Hub, Mumbai",
                "timestamp": created_iso,
            })
        if status_lower in ["shipped", "out_for_delivery", "delivered"]:
            events.append({
                "status": "shipped",
                "title": "Dispatched with Courier Partner",
                "description": f"Handed over to {order.courier_name or DEFAULT_COURIER} under AWB #{order.tracking_number or 'APS-EXP-1000'}.",
                "location": "Outward Air Cargo Terminal, Mumbai",
                "timestamp": created_iso,
            })
        if status_lower in ["out_for_delivery", "delivered"]:
            events.append({
                "status": "out_for_delivery",
                "title": "Out for Delivery",
                "description": "Courier executive is out for delivery. Please be available to receive the package.",
                "location": "Local Delivery Hub",
                "timestamp": created_iso,
            })
        if status_lower == "delivered":
            events.append({
                "status": "delivered",
                "title": "Package Delivered",
                "description": "Package delivered to the recipient with contactless verification.",
                "location": "Delivery Address",
                "timestamp": created_iso,
            })
        if status_lower == "cancelled":
            events.append({
                "status": "cancelled",
                "title": "Order Cancelled",
                "description": "This order was cancelled. Any debited amount will be refunded within 3-5 business days.",
                "location": "Order Processing Center",
                "timestamp": created_iso,
            })

    # Milestone index and progress percent
    milestone_map = {
        "confirmed": 0,
        "processing": 1,
        "shipped": 2,
        "out_for_delivery": 3,
        "delivered": 4,
    }
    milestone_index = milestone_map.get(status_lower, 0)
    percent_map = {
        "confirmed": 20,
        "processing": 45,
        "shipped": 70,
        "out_for_delivery": 90,
        "delivered": 100,
        "cancelled": 0,
    }
    progress_percent = percent_map.get(status_lower, 20)

    # Shipping address parse
    shipping_addr = None
    if order.shipping_address:
        try:
            shipping_addr = json.loads(order.shipping_address)
        except Exception:
            shipping_addr = {"raw": order.shipping_address}

    # Items summary
    items_list = []
    if order.items:
        for it in order.items:
            img = None
            if it.variant and it.variant.image_url:
                img = it.variant.image_url
            elif it.variant and it.variant.product and it.variant.product.image_url:
                img = it.variant.product.image_url

            items_list.append({
                "id": it.id,
                "product_name": it.product_name,
                "size": it.size,
                "color": it.color,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "image_url": img,
            })

    return {
        "order_id": order.id,
        "status": order.status,
        "payment_status": order.payment_status,
        "total_amount": order.total_amount,
        "created_at": created_iso,
        "tracking_number": order.tracking_number or generate_tracking_number(order.id),
        "courier_name": order.courier_name or DEFAULT_COURIER,
        "current_location": order.current_location or DEFAULT_LOCATION,
        "estimated_delivery": order.estimated_delivery or calculate_estimated_delivery(order.created_at),
        "milestone_index": milestone_index,
        "progress_percent": progress_percent,
        "is_cancelled": status_lower == "cancelled",
        "milestones": [
            {
                "index": 0,
                "key": "confirmed",
                "title": "Order Confirmed",
                "desc": "Verified & Confirmed",
                "reached": milestone_index >= 0 and status_lower != "cancelled",
            },
            {
                "index": 1,
                "key": "processing",
                "title": "Packed & Inspected",
                "desc": "Quality Checked",
                "reached": milestone_index >= 1 and status_lower != "cancelled",
            },
            {
                "index": 2,
                "key": "shipped",
                "title": "Shipped & In Transit",
                "desc": "On the way to hub",
                "reached": milestone_index >= 2 and status_lower != "cancelled",
            },
            {
                "index": 3,
                "key": "out_for_delivery",
                "title": "Out for Delivery",
                "desc": "Arriving today",
                "reached": milestone_index >= 3 and status_lower != "cancelled",
            },
            {
                "index": 4,
                "key": "delivered",
                "title": "Delivered",
                "desc": "Delivered safely",
                "reached": milestone_index >= 4 and status_lower != "cancelled",
            },
        ],
        "events": sorted(events, key=lambda e: e.get("timestamp", ""), reverse=True),
        "shipping_address": shipping_addr,
        "items_count": len(items_list),
        "items": items_list,
    }
