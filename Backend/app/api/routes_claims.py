from fastapi import APIRouter
from app.services.ml_services import ml_engine

router = APIRouter()

MOCK_CLAIMS = [
    {"id":"CLM-2024-8841","provider":"Dr. Martinez","amount":"₹18,400","icd":"Z00.00","risk":"high","score":87,"flags":"Overbill, velocity"},
    {"id":"CLM-2024-8840","provider":"City Radiology","amount":"₹3,200","icd":"M54.5","risk":"med","score":58,"flags":"Duplicate suspected"},
    {"id":"CLM-2024-8839","provider":"St. Hope Hosp.","amount":"₹940","icd":"J06.9","risk":"low","score":12,"flags":"None"},
    {"id":"CLM-2024-8838","provider":"NPI 9876543","amount":"₹7,100","icd":"F32.1","risk":"high","score":79,"flags":"Network cluster"},
    {"id":"CLM-2024-8837","provider":"Westside Clinic","amount":"₹210","icd":"Z23","risk":"low","score":8,"flags":"None"},
    {"id":"CLM-2024-8836","provider":"Dr. Patel","amount":"₹4,500","icd":"E11.65","risk":"med","score":44,"flags":"Upcoding signal"},
    {"id":"CLM-2024-8835","provider":"FastMed Inc.","amount":"₹22,000","icd":"Z00.01","risk":"high","score":93,"flags":"Overbill, ghost"},
    {"id":"CLM-2024-8834","provider":"Lakeview Lab","amount":"₹380","icd":"Z13.6","risk":"low","score":19,"flags":"None"},
]

@router.get("/claims", response_model=list)
def get_all_claims(limit: int = 100):
    return MOCK_CLAIMS[:limit]

@router.post("/claims/analyze")
def analyze_new_claim(claim_payload: dict):
    risk_score = ml_engine.calculate_risk_score(claim_payload)
    return {
        "status": "success",
        "risk_score": risk_score,
        "recommendation": "Investigate" if risk_score > 80 else "Auto-Approve"
    }
