from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_claims
from app.models.schema import Base
from app.services.ml_services import ml_engine

app = FastAPI(
    title="Healthcare Fraud Detection API",
    description="Backend API for managing Medicare claims and ML risk scoring.",
    version="1.0.0"
)

# Create Database Tables (In production, use Alembic for migrations)
# Base.metadata.create_all(bind=engine)

# Configure CORS for M3/M4 Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # React default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(routes_claims.router, prefix="/api/v1", tags=["Claims"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "ml_model_loaded": ml_engine.predictor is not None}