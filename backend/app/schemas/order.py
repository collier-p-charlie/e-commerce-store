from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.order import OrderStatus
from app.schemas.product import ProductResponse


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: Decimal
    product: ProductResponse

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    total: Decimal
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
