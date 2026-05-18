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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_claims.router, prefix="/api/v1", tags=["Claims"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "ml_model_loaded": ml_engine.model is not None}
