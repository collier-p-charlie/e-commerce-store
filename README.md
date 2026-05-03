# E-Commerce Store

This repository is an example **full-stack** for an _e-commerce_ store.

To execute the **FastAPI** locally we run

```bash
uv run uvicorn backend.app.main:app --reload
curl -X GET http://localhost:8000/health
>>> {"status": "ok"}
```

For **alembic** we do

```bash
cd backend
alembic init alembic
```

This is the migration tool for **SQLAlchemy**.
To make the first migration run 

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head  # this applies all migrations up to the latest
```

For frontend setup, in root we can run

```bash
npm --version
npm create vite@latest frontend -- --template react
```

Then for dependencies run this:

```bash
cd frontend
npm install
npm install axios react-router-dom zustand @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer @tailwindcss/vite
```

To run the server we run

```bash
cd frontend
npm run dev
```
