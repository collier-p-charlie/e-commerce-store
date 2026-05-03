import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import products, basket, wishlist, orders, auth

app = FastAPI(
    title="Shop API",
    description="API for frontend to interact with database",
    version="1.0.0-alpha.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(basket.router, prefix="/basket", tags=["basket"])
app.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":  # pragma: no cover
    uvicorn.run(app, port=8000)  # For local testing


"""
Base.metadata.create_all(bind=engine)

This says "create any tables that don't exist yet". 
It works fine the first time. But it has a critical limitation — it only ever creates tables, it never modifies them. 
So if you add a new column to a model:

class Product(Base):
    __tablename__ = "products"
    ...
    weight: Mapped[float] = mapped_column(Float, nullable=True)  # new column
    
create_all sees the products table already exists and does nothing. 
Your new column never gets added to the database. 
Your code tries to read/write weight but the column doesn't exist in SQLite. You get an error.
And it gets worse — in production on AWS with real customer data, you can't just delete the database and start again. 
You need a way to evolve the schema safely without losing any data.

ALEMBIC fixes this

Alembic is a database migration tool built specifically for SQLAlchemy. It solves this by:
- Tracking every schema change as a versioned migration file
- Knowing which migrations have already been applied to a database
- Applying only the new ones when you upgrade

Each migration is a Python file with an upgrade() function (apply the change) and a downgrade() function (undo it). 
"""
