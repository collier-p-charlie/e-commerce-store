from datetime import datetime

from pydantic import BaseModel

from app.schemas.product import ProductResponse


class AddWishlistItem(BaseModel):
    product_id: int


class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product: ProductResponse
    created_at: datetime

    model_config = {"from_attributes": True}
