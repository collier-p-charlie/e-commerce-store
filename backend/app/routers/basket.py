from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Body, HTTPException, Path, status

from app.dependencies import DbSession, CurrentUser, AdminUser
from app.models.basket import BasketItem
from app.models.product import Product
from app.schemas.basket import AddBasketItem, BasketItemResponse, BasketResponse, UpdateBasketItem

router = APIRouter()

BasketItemId = Annotated[int, Path(description="Basket item ID")]


@router.get(
    "/",
    response_model=BasketResponse
)
def get_basket(
    current_user: CurrentUser,
    db: DbSession,
):
    items = (
        db.query(BasketItem)
        .filter(BasketItem.user_id == current_user.id)
        .all()
    )
    total = sum(item.price_at_add * item.quantity for item in items)
    return BasketResponse(items=items, total=Decimal(total))


@router.post(
    "/items",
    response_model=BasketItemResponse,
    status_code=status.HTTP_201_CREATED
)
def add_basket_item(
    body: Annotated[AddBasketItem, Body(description="Product to add to basket")],
    current_user: CurrentUser,
    db: DbSession,
):
    product = db.get(Product, body.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {body.product_id} not found",
        )

    if product.stock < body.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock} units in stock",
        )

    existing = (
        db.query(BasketItem)
        .filter(
            BasketItem.user_id == current_user.id,
            BasketItem.product_id == body.product_id,
        )
        .first()
    )

    if existing:
        existing.quantity += body.quantity
        db.commit()
        db.refresh(existing)
        return existing

    item = BasketItem(
        user_id=current_user.id,
        product_id=body.product_id,
        quantity=body.quantity,
        price_at_add=product.price,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put(
    "/items/{item_id}",
    response_model=BasketItemResponse
)
def update_basket_item(
    item_id: Annotated[BasketItemId, Path(...)],
    body: Annotated[UpdateBasketItem, Body(description="Updated quantity")],
    current_user: CurrentUser,
    db: DbSession,
):
    item = (
        db.query(BasketItem)
        .filter(
            BasketItem.id == item_id,
            BasketItem.user_id == current_user.id,
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Basket item {item_id} not found",
        )

    if body.quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be at least 1",
        )

    item.quantity = body.quantity
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_basket_item(
    item_id: Annotated[BasketItemId, Path(...)],
    current_user: CurrentUser,
    db: DbSession,
):
    item = (
        db.query(BasketItem)
        .filter(
            BasketItem.id == item_id,
            BasketItem.user_id == current_user.id,
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Basket item {item_id} not found",
        )
    db.delete(item)
    db.commit()


@router.delete(
    "/",
    status_code=status.HTTP_204_NO_CONTENT
)
def clear_basket(
    current_user: CurrentUser,
    db: DbSession,
):
    db.query(BasketItem).filter(BasketItem.user_id == current_user.id).delete()
    db.commit()
