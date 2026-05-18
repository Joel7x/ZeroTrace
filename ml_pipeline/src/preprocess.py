"""
preprocess.py
=============
Simple and clean data preprocessing pipeline for healthcare fraud detection.
Steps:
1. Load data
2. Merge data on Provider, BeneID
3. Clean missing values and dates
4. Feature Engineering
5. Scale features using StandardScaler
6. Save scaler and preprocessed CSV
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Define simple feature columns for ML
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

def load_and_merge():
    print("[1/5] Loading files from data folder...")
    # Load raw CSVs
    train = pd.read_csv(os.path.join(DATA_DIR, "Train.csv"))
    beneficiary = pd.read_csv(os.path.join(DATA_DIR, "Train_Beneficiarydata.csv"))
    inpatient = pd.read_csv(os.path.join(DATA_DIR, "Train_Inpatientdata.csv"))
    outpatient = pd.read_csv(os.path.join(DATA_DIR, "Train_Outpatientdata.csv"))
    
    print(f"  Train: {train.shape}, Beneficiary: {beneficiary.shape}")
    print(f"  Inpatient: {inpatient.shape}, Outpatient: {outpatient.shape}")

    # Combine inpatient and outpatient claims
    inpatient["claim_type"] = "inpatient"
    outpatient["claim_type"] = "outpatient"
    claims = pd.concat([inpatient, outpatient], axis=0, ignore_index=True)
    print(f"  Combined claims: {claims.shape}")

    # Merge claims with beneficiary demographics
    df = pd.merge(claims, beneficiary, on="BeneID", how="left")
    
    # Merge claims with fraud labels (on Provider)
    df = pd.merge(df, train, on="Provider", how="left")
    print(f"  After merging: {df.shape}")
    return df

def clean_data(df):
    print("[2/5] Cleaning data...")
    # Convert dates to datetime
    df["AdmissionDt"] = pd.to_datetime(df["AdmissionDt"], errors="coerce")
    df["DischargeDt"] = pd.to_datetime(df["DischargeDt"], errors="coerce")
    
    # Calculate hospitalization days (DischargeDt - AdmissionDt)
    df["hospitalization_days"] = (df["DischargeDt"] - df["AdmissionDt"]).dt.days
    df["hospitalization_days"] = df["hospitalization_days"].fillna(0).clip(lower=0)

    # Convert Fraud label (Yes -> 1, No -> 0)
    if "PotentialFraud" in df.columns:
        df["PotentialFraud"] = df["PotentialFraud"].map({"Yes": 1, "No": 0}).fillna(0).astype(int)

    # Fill missing values
    df["InscClaimAmtReimbursed"] = pd.to_numeric(df["InscClaimAmtReimbursed"], errors="coerce").fillna(0)
    df["DeductibleAmtPaid"] = pd.to_numeric(df["DeductibleAmtPaid"], errors="coerce").fillna(0)
    
    return df

def engineer_features(df):
    print("[3/5] Engineering simple fraud features...")
    
    # 1. Provider stats: how many claims does each provider have?
    prov_counts = df["Provider"].value_counts().to_dict()
    df["provider_claim_count"] = df["Provider"].map(prov_counts)
    df["claim_frequency"] = df["provider_claim_count"]  # same as claim frequency

    # 2. Patient stats: how many claims does each patient have?
    bene_counts = df["BeneID"].value_counts().to_dict()
    df["patient_claim_count"] = df["BeneID"].map(bene_counts)

    # 3. Provider Average claim amount
    prov_avg_amt = df.groupby("Provider")["InscClaimAmtReimbursed"].mean().to_dict()
    df["provider_avg_claim_amount"] = df["Provider"].map(prov_avg_amt)

    # 4. Claim Amount Ratio: current claim amount / provider's average claim amount
    # Use np.where to avoid division by zero
    df["claim_amount_ratio"] = np.where(
        df["provider_avg_claim_amount"] > 0,
        df["InscClaimAmtReimbursed"] / df["provider_avg_claim_amount"],
        1.0
    )

    # 5. Duplicate claim indicator (claims with same BeneID and claim amount)
    dup_mask = df.duplicated(subset=["BeneID", "InscClaimAmtReimbursed"], keep=False)
    df["duplicate_claim_indicator"] = dup_mask.astype(int)

    return df

def scale_and_save(df):
    print("[4/5] Scaling numeric features...")
    scaler = StandardScaler()
    
    # Extract only our simple feature columns
    X = df[FEATURE_COLS].copy()
    
    # Fit and transform
    X_scaled = scaler.fit_transform(X)
    
    # Put scaled features back in dataframe with prefix
    for i, col in enumerate(FEATURE_COLS):
        df[f"{col}_scaled"] = X_scaled[:, i]
        
    # Save the fitted scaler using joblib
    scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
    joblib.dump(scaler, scaler_path)
    print(f"  Saved scaler -> {scaler_path}")
    
    return df

def run_preprocessing():
    print("=== STARTING PREPROCESSING ===")
    df = load_and_merge()
    df = clean_data(df)
    df = engineer_features(df)
    df = scale_and_save(df)
    
    # Save the processed claims
    out_path = os.path.join(DATA_DIR, "processed_claims.csv")
    df.to_csv(out_path, index=False)
    print(f"[5/5] Saved processed data -> {out_path} {df.shape}")
    print("=== PREPROCESSING COMPLETE ===\n")
    return df

if __name__ == "__main__":
    run_preprocessing()
