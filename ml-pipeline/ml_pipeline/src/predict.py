"""
predict.py
==========
Simple prediction utility to load trained models and predict fraud risk on new claims.
Can be imported as a module or run from command line with sample mock input.
"""

import os
import pandas as pd
import numpy as np
import joblib

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "model.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")

# Pre-defined feature columns in exact order
FEATURE_COLS = [
    "InscClaimAmtReimbursed",
    "DeductibleAmtPaid",
    "hospitalization_days",
    "claim_frequency",
    "patient_claim_count",
    "provider_claim_count",
    "claim_amount_ratio",
    "duplicate_claim_indicator"
]

class FraudPredictor:
    def __init__(self):
        # Load the saved model and scaler
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            raise FileNotFoundError("Trained model or scaler not found! Please run the training pipeline first.")
        
        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        print("[SUCCESS] Loaded model and scaler successfully!")

    def predict_claims(self, df_raw):
        """
        Accepts raw pandas DataFrame of new claims,
        applies preprocessing, scales features, predicts anomaly status,
        and generates risk scores, risk levels, and explanations.
        """
        df = df_raw.copy()
        
        # 1. Clean missing values and format dates
        df["InscClaimAmtReimbursed"] = pd.to_numeric(df["InscClaimAmtReimbursed"], errors="coerce").fillna(0)
        df["DeductibleAmtPaid"] = pd.to_numeric(df["DeductibleAmtPaid"], errors="coerce").fillna(0)
        
        # Calculate hospitalization days
        if "AdmissionDt" in df.columns and "DischargeDt" in df.columns:
            adm = pd.to_datetime(df["AdmissionDt"], errors="coerce")
            dis = pd.to_datetime(df["DischargeDt"], errors="coerce")
            df["hospitalization_days"] = (dis - adm).dt.days.fillna(0).clip(lower=0)
        else:
            df["hospitalization_days"] = 0.0

        # 2. Re-create simple engineered features
        # Provider stats
        df["provider_claim_count"] = df.groupby("Provider")["Provider"].transform("count").fillna(1)
        df["claim_frequency"] = df["provider_claim_count"]
        
        # Patient stats
        df["patient_claim_count"] = df.groupby("BeneID")["BeneID"].transform("count").fillna(1)

        # Claim amount ratio
        prov_avg_amt = df.groupby("Provider")["InscClaimAmtReimbursed"].transform("mean").fillna(1)
        df["claim_amount_ratio"] = np.where(prov_avg_amt > 0, df["InscClaimAmtReimbursed"] / prov_avg_amt, 1.0)

        # Duplicate billing indicator
        dup_mask = df.duplicated(subset=["BeneID", "InscClaimAmtReimbursed"], keep=False)
        df["duplicate_claim_indicator"] = dup_mask.astype(int)

        # 3. Scale features using the saved scaler
        X = df[FEATURE_COLS].copy()
        X_scaled = self.scaler.transform(X)
        
        # 4. Predict anomaly flag (1 for anomaly, 0 for normal)
        raw_preds = self.model.predict(X_scaled)
        df["fraud_prediction"] = np.where(raw_preds == -1, 1, 0)
        
        # Decision function score
        df["anomaly_score"] = self.model.decision_function(X_scaled)
        
        # Scale to 0-100 risk score
        # Note: Since we are predicting on new claims, we scale using the same standard min-max
        # of the decision function as during training or simple normalization
        scores = -df["anomaly_score"]
        df["risk_score"] = ((scores + 0.5) / 1.0 * 100).clip(0, 100).round(2)
        
        # 5. Risk Category Mapping
        def get_level(score):
            if score <= 30:
                return "LOW"
            elif score <= 70:
                return "MEDIUM"
            else:
                return "HIGH"
        df["risk_level"] = df["risk_score"].apply(get_level)

        # 6. Reasons Generator
        reasons = []
        for idx, row in df.iterrows():
            row_reasons = []
            if row["claim_amount_ratio"] > 3.0:
                row_reasons.append(f"Claim amount {row['claim_amount_ratio']:.1f}x higher than provider average")
            if row["duplicate_claim_indicator"] == 1:
                row_reasons.append("Duplicate claim amount billing pattern detected for this patient")
            if row["hospitalization_days"] > 15:
                row_reasons.append(f"Unusually long hospitalization duration ({int(row['hospitalization_days'])} days)")
            if row["provider_claim_count"] > 1000:
                row_reasons.append(f"Provider has extremely high claim submission rate ({int(row['provider_claim_count'])} claims)")
                
            reasons.append(str(row_reasons))
            
        df["fraud_reasons"] = reasons
        
        # Keep clean output columns
        output_cols = ["Provider", "BeneID", "ClaimID", "risk_score", "risk_level", "fraud_prediction", "fraud_reasons"]
        return df[output_cols]

# Run simple self-test
if __name__ == "__main__":
    predictor = FraudPredictor()
    
    # Create simple mock data of 3 claims to test
    sample_data = pd.DataFrame([
        {
            "Provider": "PRV99999",
            "BeneID": "BENE9999",
            "ClaimID": "CLM0001",
            "InscClaimAmtReimbursed": 25000,
            "DeductibleAmtPaid": 1068.0,
            "AdmissionDt": "2020-01-01",
            "DischargeDt": "2020-01-30"  # 29 hospitalization days
        },
        {
            "Provider": "PRV99999",
            "BeneID": "BENE8888",
            "ClaimID": "CLM0002",
            "InscClaimAmtReimbursed": 500,
            "DeductibleAmtPaid": 0.0,
            "AdmissionDt": "2020-01-01",
            "DischargeDt": "2020-01-02"
        }
    ])
    
    results = predictor.predict_claims(sample_data)
    print("\n--- SAMPLE PREDICTION TEST RESULTS ---")
    print(results.to_string(index=False))
