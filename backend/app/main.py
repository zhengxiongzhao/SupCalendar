from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine
from app.models.base import Base
from app.api import records, support, dashboard, calendar, profile

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SupCalandar API",
    description="Financial Reminder Calendar API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create an API router with version prefix
from fastapi import APIRouter

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(records.router)
api_router.include_router(support.router)
api_router.include_router(dashboard.router)
api_router.include_router(calendar.router)
api_router.include_router(profile.router)

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "SupCalandar API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
