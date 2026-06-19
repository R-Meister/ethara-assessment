import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import products, customers, orders
from .database import get_db
from . import crud
from fastapi import Depends
from sqlalchemy.orm import Session


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Inventory & Order Management API",
    description="A simplified inventory and order management system",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/dashboard", tags=["Dashboard"])
def get_dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
