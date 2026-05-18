"""
evaluate.py
===========
Simple evaluation script to check model metrics against true labels.
Steps:
1. Load analyzed claims dataset
2. Print classification metrics (Accuracy, Precision, Recall, F1)
3. Print Confusion Matrix
4. Generate risk distribution plots
"""

import os
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_CSV = os.path.join(DATA_DIR, "processed_claims.csv")

def run_evaluation():
    print("=== STARTING MODEL EVALUATION ===")
    
    if not os.path.exists(OUTPUT_CSV):
        raise FileNotFoundError(f"Analyzed claims file not found at {OUTPUT_CSV}. Run preprocessing and training first!")
        
    df = pd.read_csv(OUTPUT_CSV, low_memory=False)
    
    # Filter only rows that have valid target labels (PotentialFraud should be 0 or 1)
    eval_df = df[df["PotentialFraud"].isin([0, 1])].copy()
    
    if len(eval_df) == 0:
        print("[WARNING] No valid fraud labels found in the dataset to evaluate against!")
        return
        
    # True label vs predicted label
    y_true = eval_df["PotentialFraud"].astype(int)
    y_pred = eval_df["fraud_prediction"].astype(int)
    
    print("\n--- MODEL METRICS (Claim-Level) ---")
    print(f"  Accuracy  : {accuracy_score(y_true, y_pred):.4f}")
    print(f"  Precision : {precision_score(y_true, y_pred, zero_division=0):.4f}")
    print(f"  Recall    : {recall_score(y_true, y_pred, zero_division=0):.4f}")
    print(f"  F1-Score  : {f1_score(y_true, y_pred, zero_division=0):.4f}")
    
    print("\n--- CONFUSION MATRIX ---")
    cm = confusion_matrix(y_true, y_pred)
    print(f"  [[TN={cm[0,0]}  FP={cm[0,1]}]")
    print(f"   [FN={cm[1,0]}  TP={cm[1,1]}]]")
    
    # Simple risk level summary count
    print("\n--- RISK LEVEL DISTRIBUTION ---")
    print(df["risk_level"].value_counts().to_string())
    
    # Generate simple charts if matplotlib is installed
    try:
        import matplotlib.pyplot as plt
        import seaborn as sns
        
        plots_dir = os.path.join(BASE_DIR, "notebooks")
        os.makedirs(plots_dir, exist_ok=True)
        
        # Risk Score Distribution Chart
        plt.figure(figsize=(8, 5))
        sns.histplot(data=df, x="risk_score", hue="risk_level", multiple="stack", bins=20)
        plt.title("Distribution of Claim Fraud Risk Scores")
        plt.xlabel("Risk Score (0 - 100)")
        plt.ylabel("Number of Claims")
        
        plot_path = os.path.join(plots_dir, "risk_score_distribution.png")
        plt.savefig(plot_path, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"\n  Saved risk distribution chart -> {plot_path}")
        
    except Exception as e:
        print(f"\n  Could not generate chart: {e}")
        
    print("\n=== EVALUATION COMPLETE ===\n")

if __name__ == "__main__":
    run_evaluation()
