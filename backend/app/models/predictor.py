"""
ML model prediction for risk assessment
"""
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Tuple

from app.core.config import settings
from app.features.engineering import FeatureEngineer

logger = logging.getLogger("model")

class RiskPredictor:
    """Handles risk prediction using trained ML models"""
    
    def __init__(
        self, 
        model_path: Path = settings.MODEL_PATH,
        feature_engineer: FeatureEngineer = None
    ):
        """
        Initialize the risk predictor
        
        Args:
            model_path: Path to the saved risk model
            feature_engineer: FeatureEngineer instance
        """
        self.model_path = model_path
        self.model = None
        self.feature_engineer = feature_engineer or FeatureEngineer()
        self._load_model()
    
    def _load_model(self):
        """Load the risk model from disk"""
        try:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded model from {self.model_path}")
            else:
                logger.error(f"Model not found at {self.model_path}")
                raise FileNotFoundError(f"Model not found at {self.model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def predict_risk(self, wallet_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict risk for all tokens in a wallet
        
        Args:
            wallet_data: Wallet data from the data fetcher
            
        Returns:
            Dict containing risk scores and recommendations
        """
        # Generate features for each token
        features_list = self.feature_engineer.generate_features(wallet_data)
        
        if not features_list:
            logger.warning(f"No features generated for wallet {wallet_data.get('wallet_address')}")
            return {
                "wallet_address": wallet_data.get("wallet_address"),
                "overall_risk_score": 0,
                "token_risks": [],
                "recommended_action": "HOLD",
                "error": "No valid tokens found"
            }
        
        # Prepare model input
        X, original_features = self.feature_engineer.prepare_model_input(features_list)
        
        if X.empty:
            logger.warning("Empty feature matrix after preparation")
            return {
                "wallet_address": wallet_data.get("wallet_address"),
                "overall_risk_score": 0,
                "token_risks": [],
                "recommended_action": "HOLD",
                "error": "Failed to prepare features"
            }
        
        # Make predictions
        try:
            # For random forest, predict_proba returns probability for each class
            # We're interested in the probability of the high-risk class (index 1)
            if hasattr(self.model, 'predict_proba'):
                risk_probas = self.model.predict_proba(X)
                # Convert to risk scores (0-100)
                risk_scores = [float(proba[1] * 100) for proba in risk_probas]
            else:
                # Fallback for non-probabilistic models
                risk_preds = self.model.predict(X)
                # Convert to risk scores (0-100)
                risk_scores = [float(pred * 100) for pred in risk_preds]
        except Exception as e:
            logger.error(f"Error making predictions: {str(e)}")
            # Fallback to a heuristic risk score based on raw features
            risk_scores = self._calculate_heuristic_risk(original_features)
        
        # Assign risk scores to tokens and determine actions
        token_risks = []
        for i, features in enumerate(original_features):
            risk_score = risk_scores[i]
            action = self.feature_engineer.determine_risk_action(risk_score, features)
            
            token_risk = {
                "symbol": features["symbol"],
                "mint": features["mint"],
                "name": features.get("name", "Unknown Token"),
                "risk_score": risk_score,
                "usd_value": features["value_usd"],
                "portfolio_percentage": features["portfolio_pct"],
                "volatility_24h": features["volatility_24h"],
                "liquidity_usd": features["tvl_usd"],
                "age_days": features["age_days"],
                "centralized_score": features["centralized_score"],
                "recommended_action": action
            }
            
            token_risks.append(token_risk)
        
        # Sort by risk score (descending)
        token_risks.sort(key=lambda x: x["risk_score"], reverse=True)
        
        # Calculate overall wallet risk score (weighted by portfolio percentage)
        total_weight = sum(token["portfolio_percentage"] for token in token_risks)
        
        if total_weight > 0:
            overall_risk = sum(token["risk_score"] * token["portfolio_percentage"] for token in token_risks) / total_weight
        else:
            overall_risk = 0
        
        # Determine overall wallet action based on highest risk token with significant position
        significant_tokens = [t for t in token_risks if t["portfolio_percentage"] >= 5]
        if significant_tokens:
            overall_action = max(significant_tokens, key=lambda x: x["risk_score"])["recommended_action"]
        else:
            overall_action = "HOLD"
        
        # Split tokens into at-risk and safe categories
        at_risk_tokens = [t for t in token_risks if t["risk_score"] >= settings.MEDIUM_RISK_THRESHOLD]
        safe_tokens = [t for t in token_risks if t["risk_score"] < settings.MEDIUM_RISK_THRESHOLD]
        
        result = {
            "wallet_address": wallet_data.get("wallet_address"),
            "overall_risk_score": float(overall_risk),
            "recommended_action": overall_action,
            "at_risk_tokens": at_risk_tokens,
            "safe_tokens": safe_tokens
        }
        
        return result
    
    def _calculate_heuristic_risk(self, features_list: List[Dict[str, Any]]) -> List[float]:
        """
        Calculate risk scores using heuristics when model prediction fails
        
        Args:
            features_list: List of token features
            
        Returns:
            List of risk scores (0-100)
        """
        risk_scores = []
        
        for features in features_list:
            # Base risk starts at 30 (moderate)
            risk = 30.0
            
            # High volatility increases risk
            risk += min(features["volatility_24h"] * 5, 30)
            
            # Price decline increases risk
            if features["price_change_24h"] < 0:
                risk += min(abs(features["price_change_24h"]) * 2, 20)
            
            # Low liquidity increases risk
            liquidity_factor = 0
            if features["tvl_usd"] > 0:
                liquidity_factor = min(5000000 / features["tvl_usd"], 20)
            risk += liquidity_factor
            
            # High centralization increases risk
            risk += features["centralized_score"] * 10
            
            # New tokens are riskier
            if features["age_days"] < 30:
                risk += max(0, (30 - features["age_days"]) * 0.5)
            
            # Cap risk score at 0-100
            risk = max(0, min(100, risk))
            risk_scores.append(risk)
        
        return risk_scores