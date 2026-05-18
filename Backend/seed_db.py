import sys
import os
from datetime import datetime, timedelta
import random

# Add app directory to sys.path to easily import core and models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.core.database import SessionLocal, engine
from app.models.schema import Base, Provider, Claim, AuditLog

def seed_database():
    print("[SEEDER] Starting database seeding sequence...")
    
    # Initialize connection and create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if already seeded to keep idempotent
        claim_count = db.query(Claim).count()
        if claim_count > 0:
            print(f"[SEEDER] Database already populated with {claim_count} claims. Wiping old data first to clean-seed...")
            db.query(Claim).delete()
            db.query(Provider).delete()
            db.query(AuditLog).delete()
            db.commit()
            
        print("[SEEDER] Creating Provider Risk Profiles...")
        providers_data = [
            {"provider_id": "PRV55912", "calculated_risk_score": 87.4, "potential_fraud": True},
            {"provider_id": "PRV51001", "calculated_risk_score": 18.2, "potential_fraud": False},
            {"provider_id": "PRV51123", "calculated_risk_score": 52.8, "potential_fraud": False},
            {"provider_id": "PRV58992", "calculated_risk_score": 81.3, "potential_fraud": True},
            {"provider_id": "PRV57009", "calculated_risk_score": 24.5, "potential_fraud": False},
            {"provider_id": "PRV52312", "calculated_risk_score": 61.2, "potential_fraud": False}
        ]
        
        provider_instances = []
        for p in providers_data:
            prov = Provider(
                provider_id=p["provider_id"],
                calculated_risk_score=p["calculated_risk_score"],
                potential_fraud=p["potential_fraud"]
            )
            db.add(prov)
            provider_instances.append(prov)
            
        db.commit()
        print(f"[SUCCESS] Seeded {len(provider_instances)} provider risk profiles.")
        
        print("[SEEDER] Spawning realistic Medicare claim history...")
        
        # High Risk Claims mock dataset profiles
        high_risk_claims = [
            {"claim_id": "CLM60901", "provider_id": "PRV55912", "bene_id": "BENE10291", "amount": 28000, "deductible": 1068, "days": 39},
            {"claim_id": "CLM11029", "provider_id": "PRV58992", "bene_id": "BENE44219", "amount": 42000, "deductible": 1068, "days": 28},
            {"claim_id": "CLM99999", "provider_id": "PRV55912", "bene_id": "BENE99999", "amount": 35000, "deductible": 1068, "days": 45}
        ]
        
        # Low/Medium Risk Claims mock dataset profiles
        normal_claims = [
            {"claim_id": "CLM20112", "provider_id": "PRV51001", "bene_id": "BENE21004", "amount": 1200, "deductible": 0, "days": 2},
            {"claim_id": "CLM89431", "provider_id": "PRV51123", "bene_id": "BENE90102", "amount": 18500, "deductible": 1068, "days": 5},
            {"claim_id": "CLM40291", "provider_id": "PRV57009", "bene_id": "BENE77218", "amount": 6500, "deductible": 150, "days": 2},
            {"claim_id": "CLM10001", "provider_id": "PRV51001", "bene_id": "BENE11001", "amount": 500, "deductible": 0, "days": 2}
        ]
        
        seeded_claims_count = 0
        
        # 1. Add specific hand-crafted claims so they match claims desk exactly
        for c in (high_risk_claims + normal_claims):
            adm_dt = datetime(2020, 1, 1) + timedelta(days=random.randint(0, 100))
            dis_dt = adm_dt + timedelta(days=c["days"])
            
            claim = Claim(
                claim_id=c["claim_id"],
                provider_id=c["provider_id"],
                beneficiary_id=c["bene_id"],
                claim_type="Inpatient" if c["days"] > 5 else "Outpatient",
                claim_amount=float(c["amount"]),
                admission_date=adm_dt,
                discharge_date=dis_dt,
                diagnosis_codes="V58.69, 401.9, 272.4, 250.00"
            )
            db.add(claim)
            seeded_claims_count += 1
            
        # 2. Add 80 additional random claims to provide real variance in provider averages and statistics
        diagnoses = ["401.9", "272.4", "250.00", "V58.69", "272.0", "427.31", "401.1", "530.81"]
        bene_ids = [f"BENE{random.randint(10000, 99999)}" for _ in range(30)]
        
        for i in range(80):
            prov = random.choice(providers_data)
            prov_id = prov["provider_id"]
            
            # High risk providers generate larger amounts and durations
            if prov["potential_fraud"]:
                amount = float(random.randint(12000, 48000))
                deductible = 1068.0 if random.random() > 0.3 else 0.0
                days = random.randint(15, 45)
            else:
                amount = float(random.randint(400, 8000))
                deductible = float(random.choice([0, 100, 250, 1068]))
                days = random.randint(1, 6)
                
            adm_dt = datetime(2020, 1, 1) + timedelta(days=random.randint(0, 120))
            dis_dt = adm_dt + timedelta(days=days)
            claim_id = f"CLM{random.randint(10000, 99999)}"
            
            claim = Claim(
                claim_id=claim_id,
                provider_id=prov_id,
                beneficiary_id=random.choice(bene_ids),
                claim_type="Inpatient" if days > 4 else "Outpatient",
                claim_amount=amount,
                admission_date=adm_dt,
                discharge_date=dis_dt,
                diagnosis_codes=",".join(random.sample(diagnoses, k=random.randint(1, 4)))
            )
            db.add(claim)
            seeded_claims_count += 1
            
        db.commit()
        print(f"[SUCCESS] Seeded {seeded_claims_count} Medicare claims successfully into relational SQLite DB!")
        
        # Add basic audit logs
        log1 = AuditLog(provider_id="PRV55912", action_taken="Flagged for Deep Audit")
        log2 = AuditLog(provider_id="PRV58992", action_taken="Under Review")
        db.add(log1)
        db.add(log2)
        db.commit()
        print("[SUCCESS] Seeded audit logs baseline.")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
