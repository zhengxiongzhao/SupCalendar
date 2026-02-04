from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine
from app.models.base import Base
from app.api import records, support, dashboard

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

app.include_router(records.router)
app.include_router(support.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "SupCalandar API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
