import os
import logging

logger = logging.getLogger(__name__)

class FraudDetectionModel:
    def __init__(self):
        self.model = None

    def calculate_risk_score(self, claim_data: dict) -> float:
        return 87.0

ml_engine = FraudDetectionModel()
