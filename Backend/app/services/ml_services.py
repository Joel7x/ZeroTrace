import os
import sys
import pandas as pd
import logging

logger = logging.getLogger(__name__)

# Add main project root to sys.path to easily import ml_pipeline
# 4 levels up to reach c:\Users\admin\Desktop\ZeroTrace-main
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
        Takes raw claim data, converts to DataFrame, and returns a 0-100 score.
        """
        if not self.predictor:
            logger.warning("FraudPredictor not initialized. Returning fallback risk score.")
            return 50.0

        try:
            # 1. Convert dictionary/payload to DataFrame
            df = pd.DataFrame([claim_data])
            
            # 2. Run predictions using the FraudPredictor bridge
            results = self.predictor.predict_claims(df)
            
            # 3. Return the calculated risk score
            return float(results["risk_score"].iloc[0])
        except Exception as e:
            logger.error(f"Prediction failed: {e}. Returning fallback risk score.")
            return 50.0

# Singleton instance to be used by the API
ml_engine = FraudDetectionModel()