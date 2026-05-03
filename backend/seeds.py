from app.database import SessionLocal
from app.models.product import Product
from app.models.user import User
from app.routers.auth import hash_password

db = SessionLocal()

db.query(Product).delete()
db.query(User).delete()
db.commit()

users = [
    User(
        email="admin@shop.com",
        name="Admin",
        hashed_password=hash_password("password123"),
        is_admin=True,
    ),
    User(
        email="user@shop.com",
        name="Test User",
        hashed_password=hash_password("password123"),
        is_admin=False,
    ),
]

products = [
    Product(
        name="Classic White T-Shirt",
        description="A clean, minimal white tee made from 100% organic cotton.",
        price=19.99,
        stock=50,
        category="Clothing",
        image_url="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    ),
    Product(
        name="Black Denim Jeans",
        description="Slim fit black jeans with a comfortable stretch fabric.",
        price=49.99,
        stock=30,
        category="Clothing",
        image_url="https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    ),
    Product(
        name="Leather Sneakers",
        description="Minimalist white leather sneakers, versatile and durable.",
        price=89.99,
        stock=20,
        category="Footwear",
        image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    ),
    Product(
        name="Canvas Backpack",
        description="Lightweight canvas backpack with laptop compartment.",
        price=39.99,
        stock=15,
        category="Accessories",
        image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    ),
    Product(
        name="Wool Overcoat",
        description="Classic wool overcoat in charcoal grey, ideal for winter.",
        price=129.99,
        stock=10,
        category="Clothing",
        image_url="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
    ),
    Product(
        name="Sunglasses",
        description="Polarised UV400 sunglasses with acetate frames.",
        price=29.99,
        stock=40,
        category="Accessories",
        image_url="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    ),
    Product(
        name="Running Shoes",
        description="Lightweight running shoes with responsive cushioning.",
        price=74.99,
        stock=25,
        category="Footwear",
        image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    ),
    Product(
        name="Ceramic Coffee Mug",
        description="Handmade ceramic mug, holds 350ml, dishwasher safe.",
        price=14.99,
        stock=60,
        category="Home",
        image_url="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400",
    ),
]

for user in users:
    db.add(user)

for product in products:
    db.add(product)

db.commit()
db.close()

print("Seeded users and products successfully")
print("Admin: admin@shop.com / password123")
print("User:  user@shop.com / password123")
