"""
Feature engineering for risk assessment
"""
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
import joblib
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger("data")

class FeatureEngineer:
    """Handles feature generation and normalization for risk modeling"""
    
    def __init__(self, scaler_path: Path = settings.SCALER_PATH):
        """
        Initialize the feature engineer
        
        Args:
            scaler_path: Path to the saved MinMaxScaler
        """
        self.scaler_path = scaler_path
        self.scaler = None
        self._load_scaler()
    
    def _load_scaler(self):
        """Load the MinMaxScaler from disk"""
        try:
            if self.scaler_path.exists():
                self.scaler = joblib.load(self.scaler_path)
                logger.info(f"Loaded scaler from {self.scaler_path}")
            else:
                logger.warning(f"Scaler not found at {self.scaler_path}, feature scaling will be skipped")
        except Exception as e:
            logger.error(f"Error loading scaler: {str(e)}")
    
    def generate_features(self, wallet_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate features for risk assessment from wallet data
        
        Args:
            wallet_data: Wallet data from the data fetcher
            
        Returns:
            List of feature dictionaries, one per token
        """
        features_list = []
        
        if "tokens" not in wallet_data or not wallet_data["tokens"]:
            logger.warning(f"No tokens found in wallet {wallet_data.get('wallet_address')}")
            return []
        
        # Process each token in the wallet
        for token in wallet_data["tokens"]:
            # Skip tokens with zero or very low value
            if token.get("value_usd", 0) < 0.01:
                continue
                
            # Create feature dictionary
            features = {
                "mint": token["mint"],
                "symbol": token.get("symbol", "UNKNOWN"),
                "name": token.get("name", "Unknown Token"),
                "portfolio_pct": token.get("portfolio_percentage", 0),
                "age_days": token.get("age_days", 0),
                "volatility_24h": token.get("volatility_24h", 0),
                "price_change_24h": token.get("price_change_24h", 0),
                "tvl_usd": token.get("liquidity_usd", 0),
                "centralized_score": token.get("centralized_score", 0.5),
                "value_usd": token.get("value_usd", 0),
                "price_usd": token.get("price_usd", 0),
                "amount": token.get("amount", 0)
            }
            
            # Add derived features
            
            # Liquidity risk: low liquidity relative to position size is risky
            position_to_liquidity_ratio = 0
            if features["tvl_usd"] > 0:
                position_to_liquidity_ratio = min(features["value_usd"] / features["tvl_usd"] * 100, 100)
            features["position_liquidity_ratio"] = position_to_liquidity_ratio
            
            # Volatility adjusted by age: newly acquired volatile assets are riskier
            age_factor = min(features["age_days"] / 30, 1)  # Cap at 1 month
            features["volatility_age_adjusted"] = features["volatility_24h"] * (1 - age_factor * 0.5)
            
            # Concentration risk: high portfolio % + high centralization is risky
            features["concentration_risk"] = (features["portfolio_pct"] / 100) * features["centralized_score"]
            
            features_list.append(features)
        
        return features_list
    
    def prepare_model_input(self, features_list: List[Dict[str, Any]]) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
        """
        Prepare features for model input, including scaling
        
        Args:
            features_list: List of feature dictionaries from generate_features
            
        Returns:
            DataFrame of scaled features ready for model input and the original features
        """
        if not features_list:
            return pd.DataFrame(), []
        
        # Extract relevant numerical features for the model
        model_features = [
            "portfolio_pct", 
            "age_days", 
            "volatility_24h", 
            "price_change_24h",
            "tvl_usd", 
            "centralized_score",
            "position_liquidity_ratio",
            "volatility_age_adjusted",
            "concentration_risk"
        ]
        
        # Create DataFrame from feature dictionaries
        df = pd.DataFrame(features_list)
        
        # Handle missing values
        for feature in model_features:
            if feature in df.columns:
                df[feature] = df[feature].fillna(0)
        
        # Select and reorder columns for model input
        X = df[model_features].copy()
        
        # Apply feature scaling if scaler is available
        if self.scaler is not None:
            try:
                X_scaled = self.scaler.transform(X)
                X = pd.DataFrame(X_scaled, columns=model_features)
            except Exception as e:
                logger.error(f"Error scaling features: {str(e)}")
                # Continue with unscaled features
        
        return X, features_list
    
    def determine_risk_action(self, risk_score: float, token_features: Dict[str, Any]) -> str:
        """
        Determine recommended action based on risk score and token features
        
        Args:
            risk_score: Model output risk score (0-100)
            token_features: Features for the token
            
        Returns:
            Recommended action: HOLD, BUY_COVER, or SWAP
        """
        from app.api.models.request_models import RiskAction
        
        # High risk tokens should be swapped
        if risk_score >= settings.HIGH_RISK_THRESHOLD:
            return RiskAction.SWAP
        
        # Medium risk tokens might benefit from hedge/insurance
        elif risk_score >= settings.MEDIUM_RISK_THRESHOLD:
            # Check if this is a major position that's worth hedging
            if token_features["portfolio_pct"] > 15:
                return RiskAction.BUY_COVER
            else:
                return RiskAction.HOLD
        
        # Low risk tokens can be held
        else:
            return RiskAction.HOLD