from typing import Annotated

from fastapi import APIRouter, Body, HTTPException, Path, status

from app.dependencies import DbSession, CurrentUser, AdminUser
from app.models.basket import BasketItem
from app.models.product import Product
from app.models.wishlist import WishlistItem
from app.schemas.basket import BasketItemResponse
from app.schemas.wishlist import AddWishlistItem, WishlistItemResponse

router = APIRouter()

WishlistItemId = Annotated[int, Path(description="Wishlist item ID")]
ProductId = Annotated[int, Path(description="Product ID")]


@router.get(
    "/",
    response_model=list[WishlistItemResponse]
)
def get_wishlist(
    current_user: CurrentUser,
    db: DbSession,
):
    items = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id)
        .all()
    )
    return items


@router.post(
    "/items",
    response_model=WishlistItemResponse,
    status_code=status.HTTP_201_CREATED
)
def add_wishlist_item(
    body: Annotated[AddWishlistItem, Body(description="Product to add to wishlist")],
    current_user: CurrentUser,
    db: DbSession,
):
    product = db.get(Product, body.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {body.product_id} not found",
        )

    existing = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == body.product_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product {body.product_id} is already in your wishlist",
        )

    item = WishlistItem(
        user_id=current_user.id,
        product_id=body.product_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_wishlist_item(
    item_id: Annotated[WishlistItemId, Path(...)],
    current_user: CurrentUser,
    db: DbSession,
):
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id,
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wishlist item {item_id} not found",
        )
    db.delete(item)
    db.commit()


@router.post(
    "/items/{product_id}/moveToBasket",
    response_model=BasketItemResponse
)
def move_to_basket(
    product_id: ProductId,
    current_user: CurrentUser,
    db: DbSession,
):
    """This does three things atomically:
      (1) Checks the wishlist item exists;
      (2) Checks stock; and
      (3) Creates or updates the basket item, then removes it from the wishlist.
    Both db.add and db.delete happen before the single db.commit(), so either both succeed or neither does.
    So we will not end up with it deleted from the wishlist but not added to the basket.
    """

    wishlist_item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if not wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found in wishlist",
        )

    product = db.get(Product, product_id)
    if product.stock < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is out of stock",
        )

    existing_basket_item = (
        db.query(BasketItem)
        .filter(
            BasketItem.user_id == current_user.id,
            BasketItem.product_id == product_id,
        )
        .first()
    )

    if existing_basket_item:
        existing_basket_item.quantity += 1
        db.delete(wishlist_item)
        db.commit()
        db.refresh(existing_basket_item)
        return existing_basket_item

    basket_item = BasketItem(
        user_id=current_user.id,
        product_id=product_id,
        quantity=1,
        price_at_add=product.price,
    )
    db.add(basket_item)
    db.delete(wishlist_item)
    db.commit()
    db.refresh(basket_item)
    return basket_item
