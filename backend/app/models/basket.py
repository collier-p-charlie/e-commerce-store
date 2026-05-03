from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BasketItem(Base):
    __tablename__ = "basket_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ForeignKey ensures it exists in separate table
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    price_at_add: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    # allows us to do BasketItem.user and BasketItem.product.name, for example
    # backref adds the reverse, e.g. we can do User.basket_items
    user: Mapped["User"] = relationship("User", backref="basket_items")
    product: Mapped["Product"] = relationship("Product", backref="basket_items")
