from decimal import Decimal
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.product import ProductResponse


class AddBasketItem(BaseModel):
    product_id: int
    quantity: int = 1


class UpdateBasketItem(BaseModel):
    quantity: int


class BasketItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_add: Decimal
    product: Optional[ProductResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BasketResponse(BaseModel):
    items: list[BasketItemResponse]
    total: Decimal
