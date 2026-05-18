"""
train.py
========
Simple training script for Isolation Forest anomaly detection + Rule-Based explanation.
Steps:
1. Load preprocessed data
2. Train Isolation Forest model
3. Calculate simple Risk Score (0-100) and Risk Level (LOW, MEDIUM, HIGH)
4. Apply simple business rules for explanation
5. Save model and final analyzed dataset
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

PROCESSED_CSV = os.path.join(DATA_DIR, "processed_claims.csv")
MODEL_PATH = os.path.join(MODELS_DIR, "model.joblib")

# Same features used in preprocess.py
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

def load_data():
    print("[1/5] Loading preprocessed dataset...")
    df = pd.read_csv(PROCESSED_CSV, low_memory=False)
    print(f"  Loaded shape: {df.shape}")
    return df

def train_model(df):
    print("[2/5] Training Isolation Forest model...")
    # Use scaled versions of features
    scaled_cols = [f"{col}_scaled" for col in FEATURE_COLS]
    X = df[scaled_cols].fillna(0).values
    
    # Train Isolation Forest (contamination = 15%)
    model = IsolationForest(contamination=0.15, random_state=42, n_jobs=-1)
    model.fit(X)
    
    # Predict anomalies: -1 = anomaly, 1 = normal
    raw_preds = model.predict(X)
    df["fraud_prediction"] = np.where(raw_preds == -1, 1, 0)
    
    # Raw anomaly score: lower means more anomalous
    # decision_function returns negative values for anomalies, positive for normal
    df["anomaly_score"] = model.decision_function(X)
    
    print(f"  Flagged {df['fraud_prediction'].sum()} anomalies out of {len(df)} rows")
    return model, df

def calculate_risk_scores(df):
    print("[3/5] Generating Risk Scores (0-100)...")
    # Scale decision_function to a 0-100 range (more negative = higher risk score)
    scores = -df["anomaly_score"]
    
    min_val, max_val = scores.min(), scores.max()
    if max_val - min_val > 0:
        df["risk_score"] = ((scores - min_val) / (max_val - min_val)) * 100
    else:
        df["risk_score"] = 0.0
        
    df["risk_score"] = df["risk_score"].round(2)
    
    # Map to Risk Level
    def get_level(score):
        if score <= 30:
            return "LOW"
        elif score <= 70:
            return "MEDIUM"
        else:
            return "HIGH"
            
    df["risk_level"] = df["risk_score"].apply(get_level)
    return df

def apply_explainability(df):
    print("[4/5] Running rule-based explanation engine...")
    reasons = []
    
    # Iterating over dataframe to build simple, plain-text explanation lists
    for idx, row in df.iterrows():
        row_reasons = []
        
        # Rule 1: High claim amount relative to provider average
        if row["claim_amount_ratio"] > 3.0:
            row_reasons.append(f"Claim amount {row['claim_amount_ratio']:.1f}x higher than provider average")
            
        # Rule 2: Duplicate claim pattern
        if row["duplicate_claim_indicator"] == 1:
            row_reasons.append("Duplicate claim amount billing pattern detected for this patient")
            
        # Rule 3: High hospitalization days
        if row["hospitalization_days"] > 15:
            row_reasons.append(f"Unusually long hospitalization duration ({int(row['hospitalization_days'])} days)")
            
        # Rule 4: Provider claim volume is very high
        if row["provider_claim_count"] > 1000:
            row_reasons.append(f"Provider has extremely high claim submission rate ({int(row['provider_claim_count'])} claims)")
            
        reasons.append(str(row_reasons))
        
    df["fraud_reasons"] = reasons
    return df

def save_artifacts(model, df):
    # Save trained model to models/
    joblib.dump(model, MODEL_PATH)
    print(f"[5/5] Saved model -> {MODEL_PATH}")
    
    # Save final output dataframe to processed_claims.csv
    # Include required columns in final format
    output_cols = [
        "Provider", "BeneID", "ClaimID",
        "risk_score", "risk_level", "fraud_prediction", "fraud_reasons", "PotentialFraud"
    ]
    # Check if other feature columns exist, then keep them for context
    for col in FEATURE_COLS:
        if col in df.columns:
            output_cols.append(col)
            
    final_df = df[output_cols].copy()
    final_df.to_csv(PROCESSED_CSV, index=False)
    print(f"  Saved final analyzed dataset -> {PROCESSED_CSV} {final_df.shape}")

def run_training():
    print("=== STARTING MODEL TRAINING ===")
    df = load_data()
    model, df = train_model(df)
    df = calculate_risk_scores(df)
    df = apply_explainability(df)
    save_artifacts(model, df)
    print("=== MODEL TRAINING COMPLETE ===\n")
    return df

if __name__ == "__main__":
    run_training()
