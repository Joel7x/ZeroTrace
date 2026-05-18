"""
run_pipeline.py
===============
Master orchestrator script to run the healthcare fraud detection ML pipeline.
Runs:
1. Data Preprocessing
2. Model Training & Risk Scoring
3. Validation Metrics & Chart Evaluation
"""

import os
import sys

# Add src folder to the python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, "src"))

from src import preprocess
from src import train
from src import evaluate

def main():
    print("*" * 60)
    print("  HEALTHCARE INSURANCE FRAUD DETECTION PIPELINE")
    print("*" * 60)
    
    # 1. Preprocessing
    preprocess.run_preprocessing()
    
    # 2. Training
    train.run_training()
    
    # 3. Evaluation
    evaluate.run_evaluation()
    
    print("*" * 60)
    print("  [SUCCESS] Pipeline completed successfully!")
    print("  Outputs saved to:")
    print("  - Models: ml_pipeline/models/")
    print("  - Processed CSV: ml_pipeline/data/processed_claims.csv")
    print("  - Charts: ml_pipeline/notebooks/risk_score_distribution.png")
    print("*" * 60)

if __name__ == "__main__":
    main()
