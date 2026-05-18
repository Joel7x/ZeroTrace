import os
import sys
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Add main project root to sys.path to easily import ml_pipeline
MAIN_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
ML_PIPELINE_PATH = os.path.join(MAIN_ROOT, "ml-pipeline")
if ML_PIPELINE_PATH not in sys.path:
    sys.path.append(ML_PIPELINE_PATH)

try:
    from ml_pipeline.src.predict import FraudPredictor
    predictor = FraudPredictor()
    logger.info("Successfully loaded ML model and scaler via FraudPredictor bridge!")
except Exception as e:
    logger.error(f"Failed to load FraudPredictor: {e}. Running in fallback mode.")
    predictor = None

class FraudDetectionModel:
    def __init__(self):
        self.predictor = predictor

    def calculate_risk_score(self, claim_data: dict) -> float:
        """
        Legacy simple method returning float score.
        """
        if not self.predictor:
            return 50.0
        try:
            df = pd.DataFrame([claim_data])
            results = self.predictor.predict_claims(df)
            return float(results["risk_score"].iloc[0])
        except Exception:
            return 50.0

    def analyze_claim(self, claim_data: dict) -> dict:
        """
        Returns full detailed prediction dictionary for the UI simulator,
        contextually query historical database aggregates to overcome single-row constraints!
        """
        if not self.predictor:
            return {
                "status": "success",
                "risk_score": 50.0,
                "risk_level": "MEDIUM",
                "reasons": "ML Engine in fallback mode.",
                "recommendation": "Manual Review"
            }

        try:
            # 1. Connect to SQLite dynamically to fetch aggregates
            from app.core.database import SessionLocal
            from app.models.schema import Claim
            
            db = SessionLocal()
            
            prov_id = claim_data.get("Provider", "PRV_UNKNOWN")
            bene_id = claim_data.get("BeneID", "BENE_UNKNOWN")
            amount = float(claim_data.get("InscClaimAmtReimbursed", 0))
            deductible = float(claim_data.get("DeductibleAmtPaid", 0))
            
            # Calculate duration
            adm = pd.to_datetime(claim_data.get("AdmissionDt"), errors="coerce")
            dis = pd.to_datetime(claim_data.get("DischargeDt"), errors="coerce")
            hosp_days = float((dis - adm).days) if pd.notna(adm) and pd.notna(dis) else 0.0
            hosp_days = max(0.0, hosp_days)
            
            # Query provider claim history
            prov_claims = db.query(Claim).filter(Claim.provider_id == prov_id).all()
            prov_claim_count = len(prov_claims) + 1  # Add 1 for the current claim
            
            if len(prov_claims) > 0:
                prov_avg_amt = sum(c.claim_amount for c in prov_claims) / len(prov_claims)
            else:
                prov_avg_amt = 4200.0  # Kaggle training dataset median fallback
                
            claim_amount_ratio = amount / prov_avg_amt if prov_avg_amt > 0 else 1.0
            
            # Query patient claim history count
            patient_claim_count = db.query(Claim).filter(Claim.beneficiary_id == bene_id).count() + 1
            
            # Query duplicates: check if this patient has another claim with this exact amount
            duplicate_exists = db.query(Claim).filter(
                Claim.beneficiary_id == bene_id,
                Claim.claim_amount == amount
            ).count() > 0
            duplicate_indicator = 1 if duplicate_exists else 0
            
            db.close()
            
            # 2. Pack engineered features into precise order expected by the scaler
            feature_dict = {
                "InscClaimAmtReimbursed": [amount],
                "DeductibleAmtPaid": [deductible],
                "hospitalization_days": [hosp_days],
                "claim_frequency": [float(prov_claim_count)],
                "patient_claim_count": [float(patient_claim_count)],
                "provider_claim_count": [float(prov_claim_count)],
                "claim_amount_ratio": [float(claim_amount_ratio)],
                "duplicate_claim_indicator": [int(duplicate_indicator)]
            }
            
            df_scaled = pd.DataFrame(feature_dict)
            
            # 3. Scale features and run IsolationForest model
            X_scaled = self.predictor.scaler.transform(df_scaled)
            raw_pred = self.predictor.model.predict(X_scaled)[0]
            anomaly_score = self.predictor.model.decision_function(X_scaled)[0]
            
            # -----------------------------------------------------------------------
            # 4. CALIBRATED HYBRID SCORING ENGINE
            #    Combines statistical ML anomalies with highly logical domain rules.
            #    Risk scores should make absolute intuitive sense:
            #    - High deductibles relative to reimbursement = Extremely Safe (Low Risk)
            #    - Small claims (< Rs2,000) = Safely low risk
            #    - Zero/tiny deductibles on large claims = Extremely Suspicious (High Risk)
            # -----------------------------------------------------------------------
            
            # Base risk starting point for any clinical claim submission
            risk_score = 15.0
            reasons = []
            
            # --- FACTOR 1: Deductible-to-Reimbursement Ratio (Max +/- 40 pts) ---
            if amount > 0:
                deductible_ratio = deductible / amount
                
                # Proportional out-of-pocket payment indicates high genuineness
                if deductible_ratio >= 0.5:
                    # Maximum safety discount for patient paying 50% or more
                    risk_score -= 15.0
                    reasons.append(f"Safe: Highly proportional deductible (₹{deductible:,.0f} vs ₹{amount:,.0f}) indicates high genuine patient contribution.")
                elif deductible_ratio >= 0.2:
                    # Healthy out-of-pocket payment
                    risk_score -= 8.0
                    reasons.append(f"Safe: Patient paid healthy 20%+ deductible out of pocket (₹{deductible:,.0f}).")
                elif deductible_ratio < 0.01:
                    # Suspicious: near-zero deductible on non-trivial claims
                    if amount > 10000:
                        risk_score += 40.0
                        reasons.append(f"Critical: Extremely low deductible (₹{deductible:,.0f}) is only {deductible_ratio*100:.2f}% of reimbursed amount — classic billing fraud indicator.")
                    elif amount > 2000:
                        risk_score += 20.0
                        reasons.append(f"Warning: Low deductible ratio ({deductible_ratio*100:.1f}%) on a mid-sized claim.")
                elif deductible_ratio < 0.05:
                    # Suspicious: very low deductible
                    if amount > 10000:
                        risk_score += 25.0
                        reasons.append(f"Warning: Very low deductible (₹{deductible:,.0f}) relative to high reimbursement (₹{amount:,.0f}).")
                    elif amount > 2000:
                        risk_score += 12.0
                        reasons.append(f"Note: Low deductible out-of-pocket ratio ({deductible_ratio*100:.1f}%).")
            
            # --- FACTOR 2: Absolute Claim Amount Magnitude (Max +/- 15 pts) ---
            if amount < 2000:
                # Small claims are inherently low financial risk
                risk_score -= 10.0
            elif amount > 45000:
                risk_score += 15.0
                reasons.append(f"High-Value: Large claim size (₹{amount:,.0f}) increases financial exposure.")
            elif amount > 20000:
                risk_score += 8.0
                reasons.append(f"Mid-High Value: Claim amount exceeds ₹20,000.")

            # --- FACTOR 3: Provider Claim Volume Context (Max +15 pts) ---
            if claim_amount_ratio > 3.0:
                risk_score += 15.0
                reasons.append(f"Anomalous: Reimbursed amount is {claim_amount_ratio:.1f}x the historic average of this Provider (₹{prov_avg_amt:,.0f}).")
            elif claim_amount_ratio > 1.8:
                risk_score += 8.0
                reasons.append(f"Elevated: Claim size is {claim_amount_ratio:.1f}x the Provider's baseline average.")

            # --- FACTOR 4: Hospitalization Duration (Max +15 pts) ---
            if hosp_days > 20:
                risk_score += 15.0
                reasons.append(f"Anomalous: Unusually long stay duration ({int(hosp_days)} days) compared to standard clinical baselines.")
            elif hosp_days > 10:
                risk_score += 7.0
                reasons.append(f"Extended: Hospitalization stay duration is {int(hosp_days)} days.")

            # --- FACTOR 5: Database Duplicate Check (Max +20 pts) ---
            if duplicate_indicator == 1:
                # Only flag as high severity if claim value is significant (> Rs2,000)
                if amount > 2000:
                    risk_score += 20.0
                    reasons.append("Flagged: Multiple identical claim amounts submitted for this Patient ID.")
                else:
                    risk_score += 8.0
                    reasons.append("Note: Minor duplicate claim amount check triggered in historical records.")

            # --- FACTOR 6: Statistical ML Model Output (Max +/- 15 pts) ---
            # anomaly_score < 0 is a statistical outlier in Isolation Forest
            if anomaly_score < 0:
                risk_score += 12.0
                reasons.append("ML Engine: Statistical multi-feature outlier detected by Isolation Forest.")
            elif anomaly_score > 0.1:
                # Strong statistical inlier reduces risk
                risk_score -= 8.0

            # --- FINAL SCORE CALIBRATION ---
            # Ensure final score is neatly bounded between 5% and 100%
            final_score = round(max(5.0, min(100.0, risk_score)), 1)
            
            # Determine appropriate threat levels and user action recommendations
            if final_score > 75.0:
                level = "HIGH"
                recommendation = "Investigate Immediately"
            elif final_score > 30.0:
                level = "MEDIUM"
                recommendation = "Flag for Review"
            else:
                level = "LOW"
                recommendation = "Auto-Approve"
                
            # Clean up reason strings: if no major warnings triggered, show safe baseline text
            clean_reasons = [r for r in reasons if not r.startswith("Safe:")]
            if not clean_reasons:
                if final_score <= 30.0:
                    reason_str = "Normal claim profile matching standard historical baseline. Proportional patient deductible confirms authenticity."
                else:
                    reason_str = "Normal claim profile matching standard historical baseline."
            else:
                reason_str = ", ".join(clean_reasons)
            
            return {
                "status": "success",
                "risk_score": final_score,
                "risk_level": level,
                "reasons": reason_str,
                "recommendation": recommendation
            }
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "risk_score": 50.0,
                "risk_level": "MEDIUM",
                "reasons": "System error during contextual scaling and inference.",
                "recommendation": "Manual Review"
            }

# Singleton instance to be used by the API
ml_engine = FraudDetectionModel()