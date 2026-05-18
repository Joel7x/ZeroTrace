from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime
import random

from app.core.database import get_db
from app.models.schema import Claim, Provider, AuditLog
from app.services.ml_services import ml_engine

router = APIRouter()

@router.get("/claims", response_model=list)
def get_all_claims(limit: int = 150, db: Session = Depends(get_db)):
    """Fetch claims from SQLite to populate the React Table Explorer."""
    claims = db.query(Claim).order_by(Claim.admission_date.desc()).limit(limit).all()
    mapped = []
    
    for c in claims:
        # Fetch provider risk info to calculate level and reasons
        score = c.provider.calculated_risk_score if c.provider else 45.0
        level = "HIGH" if score > 70 else ("MEDIUM" if score > 30 else "LOW")
        
        # Calculate duration
        days = (c.discharge_date - c.admission_date).days if c.admission_date and c.discharge_date else 0
        
        # Formulate a beautiful diagnostic reason
        reason_list = []
        if c.claim_amount > 20000:
            reason_list.append(f"High reimbursement amount (₹{c.claim_amount:,.0f})")
        if days > 15:
            reason_list.append(f"Unusually long hospitalization stay ({days} days)")
        
        reason = ", ".join(reason_list) if reason_list else "Normal claim profile matching standard historical baseline."
        
        mapped.append({
            "ClaimID": c.claim_id,
            "Provider": c.provider_id,
            "BeneID": c.beneficiary_id,
            "Amount": c.claim_amount,
            "Deductible": 1068.0 if c.claim_type == "Inpatient" else 0.0,
            "Admission": c.admission_date.strftime("%Y-%m-%d") if c.admission_date else "",
            "Discharge": c.discharge_date.strftime("%Y-%m-%d") if c.discharge_date else "",
            "Level": level,
            "Score": score,
            "Reason": reason
        })
    return mapped

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes dynamic aggregate claims stats for the Recharts graphics."""
    total_claims = db.query(Claim).count()
    if total_claims == 0:
        return {
            "total_claims": "0", "flagged_anomalies": "0", "flagged_rate": "0.0%",
            "saved_losses": "₹0.0 Cr", "risk_accuracy": "66.90%", "distribution": [], "top_providers": []
        }
        
    # Count how many claims have a provider with risk score > 70
    flagged_count = db.query(Claim).join(Provider).filter(Provider.calculated_risk_score > 70).count()
    
    # Sum of claim amounts of flagged claims
    total_flagged_amount = db.query(Claim).join(Provider).filter(Provider.calculated_risk_score > 70).with_entities(Claim.claim_amount).all()
    saved_amount_val = sum(x[0] for x in total_flagged_amount if x[0] is not None)
    
    # Low, Medium, High risk distribution count for Pie Chart
    low_count = db.query(Claim).join(Provider).filter(Provider.calculated_risk_score <= 30).count()
    med_count = db.query(Claim).join(Provider).filter(Provider.calculated_risk_score > 30).filter(Provider.calculated_risk_score <= 70).count()
    high_count = db.query(Claim).join(Provider).filter(Provider.calculated_risk_score > 70).count()
    
    # Top 5 suspicious providers by volume for Bar Chart
    top_providers = db.query(Claim.provider_id, func.sum(Claim.claim_amount)).group_by(Claim.provider_id).order_by(func.sum(Claim.claim_amount).desc()).limit(5).all()
    
    provider_stats = []
    for tp in top_providers:
        provider_stats.append({
            "name": tp[0],
            "amount": float(tp[1])
        })
        
    return {
        "total_claims": f"{total_claims:,}",
        "flagged_anomalies": f"{flagged_count:,}",
        "flagged_rate": f"{((flagged_count / total_claims) * 100):.1f}%",
        "saved_losses": f"₹{(saved_amount_val / 10000000):.1f} Cr",
        "risk_accuracy": "66.90%",
        "distribution": [
            { "name": "Low Risk", "value": low_count, "color": "#10B981" },
            { "name": "Medium Risk", "value": med_count, "color": "#F59E0B" },
            { "name": "High Risk", "value": high_count, "color": "#EF4444" }
        ],
        "top_providers": provider_stats
    }

@router.get("/providers/{provider_id}/risk")
def get_provider_risk(provider_id: str, db: Session = Depends(get_db)):
    """Fetch a specific provider and their aggregated risk score."""
    provider = db.query(Provider).filter(Provider.provider_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    return {
        "provider_id": provider.provider_id,
        "risk_score": provider.calculated_risk_score,
        "is_flagged": provider.calculated_risk_score > 70
    }

@router.post("/claims/analyze")
def analyze_new_claim(claim_payload: dict, db: Session = Depends(get_db)):
    """Accepts claim data, runs inference, and persists results to SQLite DB."""
    result = ml_engine.analyze_claim(claim_payload)
    
    if result.get("status") == "success":
        try:
            prov_id = claim_payload.get("Provider", "PRV_UNKNOWN")
            
            # 1. Sync Provider profile risk details
            provider = db.query(Provider).filter(Provider.provider_id == prov_id).first()
            if not provider:
                provider = Provider(
                    provider_id=prov_id,
                    calculated_risk_score=result["risk_score"],
                    potential_fraud=result["risk_level"] == "HIGH"
                )
                db.add(provider)
            else:
                # Dynamically update aggregate risk mapping based on latest simulation score
                provider.calculated_risk_score = result["risk_score"]
                provider.potential_fraud = result["risk_level"] == "HIGH"
                
            # 2. Add dynamic Claim record
            adm_dt = datetime.strptime(claim_payload.get("AdmissionDt"), "%Y-%m-%d") if claim_payload.get("AdmissionDt") else None
            dis_dt = datetime.strptime(claim_payload.get("DischargeDt"), "%Y-%m-%d") if claim_payload.get("DischargeDt") else None
            
            new_claim = Claim(
                claim_id=claim_payload.get("ClaimID", f"CLM{random.randint(10000, 99999)}"),
                provider_id=prov_id,
                beneficiary_id=claim_payload.get("BeneID", "BENE_UNKNOWN"),
                claim_type="Inpatient" if adm_dt and dis_dt and (dis_dt - adm_dt).days > 4 else "Outpatient",
                claim_amount=float(claim_payload.get("InscClaimAmtReimbursed", 0)),
                admission_date=adm_dt,
                discharge_date=dis_dt,
                diagnosis_codes="V58.69, Live Simulation Anomaly"
            )
            db.add(new_claim)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[ERROR] Failed to persist dynamic simulation claim: {e}")
            
    return result