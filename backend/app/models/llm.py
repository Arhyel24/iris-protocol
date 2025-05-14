"""
LLM integration for generating explanations of risk scores
"""
import logging
import json
import time
import aiohttp
from typing import Dict, List, Any, Optional
import os

from app.core.config import settings

logger = logging.getLogger("llm")

class LLMExplainer:
    """Handles LLM-based explanations for risk assessments"""
    
    def __init__(self):
        """Initialize the LLM explainer"""
        self.session = None
        self.cache = {}
    
    async def initialize(self):
        """Initialize the HTTP session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=settings.REQUEST_TIMEOUT)
            )
        return self
    
    async def close(self):
        """Close the HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def _create_prompt(self, risk_data: Dict[str, Any]) -> str:
        """
        Create a prompt for the LLM based on risk assessment data
        
        Args:
            risk_data: Risk assessment data
            
        Returns:
            Prompt string for the LLM
        """
        wallet_address = risk_data.get("wallet_address", "unknown")
        overall_risk = risk_data.get("overall_risk_score", 0)
        action = risk_data.get("recommended_action", "HOLD")
        
        at_risk_tokens = risk_data.get("at_risk_tokens", [])
        safe_tokens = risk_data.get("safe_tokens", [])
        
        tokens_info = []
        
        # Add at-risk tokens first
        for token in at_risk_tokens:
            tokens_info.append(
                f"Token: {token.get('symbol')} ({token.get('name')})\n"
                f"Risk Score: {token.get('risk_score'):.2f}/100\n"
                f"Portfolio %: {token.get('portfolio_percentage'):.2f}%\n"
                f"Value: ${token.get('usd_value'):.2f}\n"
                f"Volatility (24h): {token.get('volatility_24h'):.2f}%\n"
                f"Liquidity: ${token.get('liquidity_usd', 0):,.2f}\n"
                f"Token Age: {token.get('age_days'):.1f} days\n"
                f"Centralization: {token.get('centralized_score'):.2f}/1.0\n"
                f"Recommended Action: {token.get('recommended_action')}"
            )
        
        # Add top 3 safe tokens (if any)
        for token in safe_tokens[:3]:
            tokens_info.append(
                f"Token: {token.get('symbol')} ({token.get('name')})\n"
                f"Risk Score: {token.get('risk_score'):.2f}/100\n"
                f"Portfolio %: {token.get('portfolio_percentage'):.2f}%\n"
                f"Recommended Action: {token.get('recommended_action')}"
            )
        
        token_details = "\n\n".join(tokens_info)
        
        prompt = f"""
You are IRIS, an AI Risk Engine that analyzes crypto portfolios. Explain the risk assessment results to the wallet owner in a clear, helpful way.

Wallet Address: {wallet_address}
Overall Risk Score: {overall_risk:.2f}/100
Recommended Action: {action}

Token Details:
{token_details}

Based on this data, please provide:
1. A brief explanation of the overall risk score
2. Identification of the highest risk token and why it's risky
3. Specific recommended actions the user should take
4. A bulleted list of 2-3 suggestions to improve portfolio safety

Format your response as a JSON object with the following structure:
{
  "wallet_address": "wallet address here",
  "overall_risk_score": overall_risk_score_as_float,
  "recommended_action": "HOLD or BUY_COVER or SWAP",
  "at_risk_token": "symbol of highest risk token",
  "confidence": confidence_score_as_float_between_0_and_1,
  "reason": "clear explanation of the risk assessment in 2-3 sentences",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}
"""
        return prompt
    
    async def generate_explanation(self, risk_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an explanation for the risk assessment using an LLM
        
        Args:
            risk_data: Risk assessment data
            
        Returns:
            Dict containing the explanation
        """
        if not settings.USE_LLM:
            return self._generate_fallback_explanation(risk_data)
        
        wallet_address = risk_data.get("wallet_address", "unknown")
        
        # Check cache
        cache_key = f"explain_{wallet_address}_{hash(str(risk_data))}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        prompt = self._create_prompt(risk_data)
        
        start_time = time.time()
        
        try:
            if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
                explanation = await self._call_openai(prompt)
            elif settings.LLM_PROVIDER == "llama" and settings.LLAMA_ENDPOINT:
                explanation = await self._call_llama(prompt)
            else:
                logger.warning("No valid LLM configuration found, using fallback explanation")
                explanation = self._generate_fallback_explanation(risk_data)
        except Exception as e:
            logger.error(f"Error generating LLM explanation: {str(e)}")
            explanation = self._generate_fallback_explanation(risk_data)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        # Add processing time
        explanation["processing_time_ms"] = processing_time
        
        # Cache result
        self.cache[cache_key] = explanation
        
        return explanation
    
    async def _call_openai(self, prompt: str) -> Dict[str, Any]:
        """
        Call OpenAI API to generate explanation
        
        Args:
            prompt: LLM prompt
            
        Returns:
            Dict containing the LLM response
        """
        try:
            endpoint = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}"
            }
            
            payload = {
                "model": settings.OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": "You are IRIS, an AI Risk Engine that provides clear explanations of crypto portfolio risk assessments."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 500
            }
            
            async with self.session.post(endpoint, headers=headers, json=payload) as response:
                if response.status != 200:
                    logger.error(f"OpenAI API error: {await response.text()}")
                    return self._generate_fallback_explanation({"prompt": prompt})
                
                data = await response.json()
                content = data["choices"][0]["message"]["content"]
                
                # Parse JSON response
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    logger.error("Failed to parse LLM response as JSON")
                    # Extract data using regex or other methods if needed
                    return self._generate_fallback_explanation({"prompt": prompt})
                
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {str(e)}")
            return self._generate_fallback_explanation({"prompt": prompt})
    
    async def _call_llama(self, prompt: str) -> Dict[str, Any]:
        """
        Call self-hosted LLaMA API to generate explanation
        
        Args:
            prompt: LLM prompt
            
        Returns:
            Dict containing the LLM response
        """
        try:
            endpoint = settings.LLAMA_ENDPOINT
            
            payload = {
                "prompt": prompt,
                "temperature": 0.3,
                "max_tokens": 500,
                "stop": ["}"],  # Stop at the end of the JSON
            }
            
            async with self.session.post(endpoint, json=payload) as response:
                if response.status != 200:
                    logger.error(f"LLaMA API error: {await response.text()}")
                    return self._generate_fallback_explanation({"prompt": prompt})
                
                data = await response.json()
                content = data.get("generation", "")
                
                # Ensure we have a complete JSON object
                if not content.strip().endswith("}"):
                    content += "}"
                
                # Parse JSON response
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    logger.error("Failed to parse LLM response as JSON")
                    return self._generate_fallback_explanation({"prompt": prompt})
                
        except Exception as e:
            logger.error(f"Error calling LLaMA API: {str(e)}")
            return self._generate_fallback_explanation({"prompt": prompt})
    
    def _generate_fallback_explanation(self, risk_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a fallback explanation when LLM fails
        
        Args:
            risk_data: Risk assessment data
            
        Returns:
            Dict containing the explanation
        """
        wallet_address = risk_data.get("wallet_address", "unknown")
        overall_risk = risk_data.get("overall_risk_score", 0)
        action = risk_data.get("recommended_action", "HOLD")
        
        at_risk_tokens = risk_data.get("at_risk_tokens", [])
        
        # Determine highest risk token
        at_risk_token = "None"
        if at_risk_tokens:
            at_risk_token = at_risk_tokens[0].get("symbol", "Unknown")
        
        # Generate reason based on risk level
        if overall_risk >= 75:
            reason = "Your portfolio contains high-risk assets with significant volatility and low liquidity. Immediate action is recommended to reduce exposure."
            suggestions = [
                "Swap high-risk tokens for stablecoins like USDC",
                "Reduce concentration in volatile assets",
                "Consider hedging strategies for remaining positions"
            ]
            confidence = 0.85
        elif overall_risk >= 50:
            reason = "Your portfolio has moderate risk exposure with some volatility. Consider insurance or partial rebalancing."
            suggestions = [
                "Look into DeFi insurance protocols for your larger positions",
                "Diversify into some lower-risk assets",
                "Monitor market conditions closely"
            ]
            confidence = 0.75
        else:
            reason = "Your portfolio is relatively low-risk. Continue to hold but monitor market conditions."
            suggestions = [
                "Maintain current positions",
                "Set up alerts for any sudden market changes",
                "Consider DCA strategies for any new investments"
            ]
            confidence = 0.9
        
        return {
            "wallet_address": wallet_address,
            "overall_risk_score": overall_risk,
            "recommended_action": action,
            "at_risk_token": at_risk_token,
            "confidence": confidence,
            "reason": reason,
            "suggestions": suggestions
        }