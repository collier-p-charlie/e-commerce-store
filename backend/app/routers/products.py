from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Body, Path, status

from app.dependencies import DbSession
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter()

CategoryFilter = Annotated[str | None, Query(description="Filter by category")]
SearchFilter = Annotated[str | None, Query(description="Search by product name")]
PageParam = Annotated[int, Query(ge=1, description="Page number")]
LimitParam = Annotated[int, Query(ge=1, le=100, description="Results per page")]
ProductId = Annotated[int, Path(description="Product ID")]


@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_products(
    db: DbSession,
    category: CategoryFilter = None,
    search: SearchFilter = None,
    page: PageParam = 1,
    limit: LimitParam = None
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()


@router.get(
    "/categories",
    response_model=list[str]
)
def get_categories(
    db: DbSession
):
    rows = db.query(Product.category).distinct().filter(Product.category.isnot(None)).all()
    return [row.category for row in rows]


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: ProductId,
    db: DbSession,
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    return product


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    body: Annotated[ProductCreate, Body(...)],
    db: DbSession,
):
    product = Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    # after a commit, the SQLAlchemy object in memory might be stale
    # the .refresh() re-read it from the DB so we get the latest version (consistency)
    # will now include the `created_at` also, for example
    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: ProductId,
    body: Annotated[ProductUpdate, Body(...)],
    db: DbSession,
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: ProductId,
    db: DbSession,
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    db.delete(product)
    db.commit()
