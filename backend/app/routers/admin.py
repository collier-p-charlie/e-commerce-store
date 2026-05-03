from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status as f_status

from app.database import get_db
from app.dependencies import AdminUser, DbSession
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.order import OrderResponse
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter()

OrderId = Annotated[int, Path(description="Order ID")]
UserId = Annotated[int, Path(description="User ID")]
ProductId = Annotated[int, Path(description="Product ID")]
StatusFilter = Annotated[str | None, Query(description="Filter by order status")]


@router.get(
    "/orders",
    response_model=list[OrderResponse]
)
def get_all_orders(
    db: DbSession,
    admin: AdminUser = None,
    status: StatusFilter = None,
):
    query = db.query(Order)
    if status:
        try:
            query = query.filter(Order.status == OrderStatus(status))
        except ValueError:
            raise HTTPException(
                status_code=f_status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status value",
            )
    return query.order_by(Order.created_at.desc()).all()


@router.put(
    "/orders/{order_id}/status",
    response_model=OrderResponse
)
def update_order_status(
    db: DbSession,
    order_id: OrderId,
    body: Annotated[dict, Body(description="New status")],
    admin: AdminUser = None,
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=f_status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found",
        )
    try:
        order.status = OrderStatus(body["status"])
    except (ValueError, KeyError):
        raise HTTPException(
            status_code=f_status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value",
        )
    db.commit()
    db.refresh(order)
    return order


@router.get(
    "/users",
    response_model=list[UserResponse]
)
def get_all_users(
    db: DbSession,
    admin: AdminUser = None,
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get(
    "/users/{user_id}",
    response_model=UserResponse
)
def get_user(
    db: DbSession,
    user_id: UserId,
    admin: AdminUser = None,
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=f_status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    return user


@router.delete(
    "/users/{user_id}",
    status_code=f_status.HTTP_204_NO_CONTENT
)
def delete_user(
    db: DbSession,
    user_id: UserId,
    admin: AdminUser = None,
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=f_status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    if user.is_admin:
        raise HTTPException(
            status_code=f_status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an admin user",
        )
    db.delete(user)
    db.commit()


@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=f_status.HTTP_201_CREATED
)
def create_product(
    db: DbSession,
    body: Annotated[ProductCreate, Body(description="Product to create")],
    admin: AdminUser = None,
):
    product = Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put(
    "/products/{product_id}",
    response_model=ProductResponse
)
def update_product(
    db: DbSession,
    product_id: ProductId,
    body: Annotated[ProductUpdate, Body(description="Fields to update")],
    admin: AdminUser = None,
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=f_status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete(
    "/products/{product_id}",
    status_code=f_status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: ProductId,
    admin: AdminUser,
    db: DbSession,
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=f_status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    db.delete(product)
    db.commit()
