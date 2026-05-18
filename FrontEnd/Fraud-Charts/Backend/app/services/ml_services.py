import joblib
import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

# Path where M1 will drop the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml_pipeline", "models", "isolation_forest.joblib")

class FraudDetectionModel:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
                logger.info("Successfully loaded ML model.")
            else:
                logger.warning(f"Model not found at {MODEL_PATH}. Running in fallback mode.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")

    def calculate_risk_score(self, claim_data: dict) -> float:
        """
        Takes raw claim data, converts to DataFrame, and returns a 0-100 score.
        """
        if not self.model:
            # Fallback/Dummy logic if M1 model isn't ready
            return 50.0 

        # 1. Convert dict to DataFrame
        df = pd.DataFrame([claim_data])
        
        # 2. Get anomaly score (sklearn IsolationForest returns negative values for anomalies)
        # M1 will need to define exactly how they want this normalized.
        raw_score = self.model.decision_function(df)[0]
        
        # 3. Normalize to 0-100 risk score (Example logic)
        risk_score = max(0, min(100, (1 - raw_score) * 100))
        return round(risk_score, 2)

# Singleton instance to be used by the API
ml_engine = FraudDetectionModel()