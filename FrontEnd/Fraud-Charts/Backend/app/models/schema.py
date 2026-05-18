from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Provider(Base):
    __tablename__ = "providers"
    
    provider_id = Column(String, primary_key=True, index=True)
    potential_fraud = Column(Boolean, default=False) # Kaggle label
    calculated_risk_score = Column(Float, default=0.0) # From M1 Model
    
    claims = relationship("Claim", back_populates="provider")

class Claim(Base):
    __tablename__ = "claims"
    
    claim_id = Column(String, primary_key=True, index=True)
    provider_id = Column(String, ForeignKey("providers.provider_id"))
    beneficiary_id = Column(String, index=True)
    claim_type = Column(String) # Inpatient or Outpatient
    claim_amount = Column(Float)
    admission_date = Column(DateTime)
    discharge_date = Column(DateTime)
    diagnosis_codes = Column(String) # Comma-separated or JSON
    
    provider = relationship("Provider", back_populates="claims")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(String, ForeignKey("providers.provider_id"))
    action_taken = Column(String) # e.g., "Reviewed", "Flagged"
    timestamp = Column(DateTime, default=datetime.utcnow)