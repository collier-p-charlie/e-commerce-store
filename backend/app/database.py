from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

engine = create_engine(  # SQLAlchemy connection to DB
    settings.database_url,
    connect_args={
        "check_same_thread": False  # SQLite only works on 1 thread, but FastAPI uses threads internally
    },
)

SessionLocal = sessionmaker(
    autocommit=False,  # changes are not made until we run db.commit(); control over transactions
    autoflush=False,
    bind=engine
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
