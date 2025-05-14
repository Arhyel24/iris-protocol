"""
Data ingestion module for fetching on-chain and market data
"""
import logging
import aiohttp
import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

from app.core.config import settings

logger = logging.getLogger("data")

class DataFetcher:
    """Handles fetching data from various sources"""
    
    def __init__(self):
        self.session = None
        self.cache = {}
        self.cache_timestamps = {}
    
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
    
    def _get_from_cache(self, cache_key: str) -> Optional[Any]:
        """Get data from cache if fresh"""
        if cache_key in self.cache:
            timestamp = self.cache_timestamps.get(cache_key, 0)
            if time.time() - timestamp < settings.CACHE_EXPIRY:
                return self.cache[cache_key]
        return None
    
    def _set_cache(self, cache_key: str, data: Any):
        """Set data in cache"""
        self.cache[cache_key] = data
        self.cache_timestamps[cache_key] = time.time()
    
    async def get_wallet_balances(self, wallet_address: str) -> Dict[str, Any]:
        """
        Fetch wallet balances and token holdings using Helius API
        
        Args:
            wallet_address: Solana wallet address
            
        Returns:
            Dict containing wallet balance information
        """
        cache_key = f"balance_{wallet_address}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            endpoint = f"{settings.HELIUS_RPC_URL}"
            payload = {
                "jsonrpc": "2.0",
                "id": "my-id",
                "method": "getTokenAccountsByOwner",
                "params": [
                    wallet_address,
                    {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
                    {"encoding": "jsonParsed"}
                ]
            }
            
            async with self.session.post(endpoint, json=payload) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch wallet balances: {await response.text()}")
                    return {"error": "Failed to fetch wallet data", "status": response.status}
                
                data = await response.json()
                result = {
                    "wallet_address": wallet_address,
            "tokens": token_data,
            "total_value_usd": total_value_usd,
            "timestamp": datetime.now().isoformat()
        }
        
        return result
    
    def _calculate_token_age(self, wallet_address: str, transactions: List[Dict], token_addresses: List[str]) -> Dict[str, float]:
        """
        Calculate how long tokens have been held in the wallet
        
        Args:
            wallet_address: Solana wallet address
            transactions: List of wallet transactions
            token_addresses: List of token mint addresses
            
        Returns:
            Dict mapping token addresses to age in days
        """
        # In a real implementation, this would analyze transaction history to find first deposit
        # For now, we'll simulate with reasonable age values
        result = {}
        
        # Generate pseudo-random but deterministic age values
        for token_address in token_addresses:
            # Simulate token age between 1 and 365 days based on address hash
            result[token_address] = 1 + (hash(f"{wallet_address}_{token_address}") % 365)
            
        return result
                    "tokens": [],
                    "sol_balance": 0,
                    "timestamp": datetime.now().isoformat()
                }
                
                # Extract token data
                if "result" in data and "value" in data["result"]:
                    for item in data["result"]["value"]:
                        if "account" in item and "data" in item["account"]:
                            parsed = item["account"]["data"]["parsed"]
                            if "info" in parsed and "tokenAmount" in parsed["info"]:
                                token_data = parsed["info"]
                                mint = token_data.get("mint", "")
                                amount = float(token_data["tokenAmount"].get("uiAmount", 0))
                                if amount > 0:
                                    result["tokens"].append({
                                        "mint": mint,
                                        "amount": amount
                                    })
                
                # Get SOL balance in a separate call
                sol_payload = {
                    "jsonrpc": "2.0",
                    "id": "my-id",
                    "method": "getBalance",
                    "params": [wallet_address]
                }
                
                async with self.session.post(endpoint, json=sol_payload) as sol_response:
                    if sol_response.status == 200:
                        sol_data = await sol_response.json()
                        if "result" in sol_data and "value" in sol_data["result"]:
                            # Convert lamports to SOL
                            result["sol_balance"] = sol_data["result"]["value"] / 1_000_000_000
                
                self._set_cache(cache_key, result)
                return result
                
        except Exception as e:
            logger.error(f"Error fetching wallet balances: {str(e)}")
            return {"error": str(e)}
    
    async def get_token_metadata(self, token_addresses: List[str]) -> Dict[str, Dict]:
        """
        Fetch token metadata (name, symbol, etc.) for multiple tokens
        
        Args:
            token_addresses: List of token mint addresses
            
        Returns:
            Dict mapping token addresses to their metadata
        """
        cache_key = f"metadata_{','.join(sorted(token_addresses))}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            endpoint = f"{settings.HELIUS_RPC_URL}"
            result = {}
            
            # Process in batches of 100 (Helius limit)
            for i in range(0, len(token_addresses), 100):
                batch = token_addresses[i:i+100]
                
                payload = {
                    "jsonrpc": "2.0",
                    "id": "metadata",
                    "method": "getTokenMetadata",
                    "params": [batch]
                }
                
                async with self.session.post(endpoint, json=payload) as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch token metadata: {await response.text()}")
                        continue
                    
                    data = await response.json()
                    if "result" in data:
                        for token_address, metadata in data["result"].items():
                            result[token_address] = {
                                "symbol": metadata.get("symbol", "UNKNOWN"),
                                "name": metadata.get("name", "Unknown Token"),
                                "decimals": metadata.get("decimals", 9),
                                "logo": metadata.get("logoURI", "")
                            }
            
            self._set_cache(cache_key, result)
            return result
                
        except Exception as e:
            logger.error(f"Error fetching token metadata: {str(e)}")
            return {}
    
    async def get_transaction_history(self, wallet_address: str, limit: int = 100) -> List[Dict]:
        """
        Fetch transaction history for a wallet
        
        Args:
            wallet_address: Solana wallet address
            limit: Maximum number of transactions to fetch
            
        Returns:
            List of transaction objects
        """
        cache_key = f"txn_{wallet_address}_{limit}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            endpoint = f"{settings.HELIUS_RPC_URL}"
            payload = {
                "jsonrpc": "2.0",
                "id": "my-id",
                "method": "getSignaturesForAddress",
                "params": [
                    wallet_address,
                    {"limit": limit}
                ]
            }
            
            async with self.session.post(endpoint, json=payload) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch transaction history: {await response.text()}")
                    return []
                
                data = await response.json()
                if "result" in data:
                    transactions = data["result"]
                    self._set_cache(cache_key, transactions)
                    return transactions
                return []
                
        except Exception as e:
            logger.error(f"Error fetching transaction history: {str(e)}")
            return []
    
    async def get_token_prices(self, token_addresses: List[str]) -> Dict[str, float]:
        """
        Fetch current token prices from CoinGecko or other sources
        
        Args:
            token_addresses: List of token mint addresses
            
        Returns:
            Dict mapping token addresses to their USD prices
        """
        cache_key = f"prices_{','.join(sorted(token_addresses))}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            # For Solana tokens, we need to map mint addresses to CoinGecko IDs
            # This would typically require a separate database or API call
            # For simplicity, we'll use Jupiter API as a fallback
            
            jupiter_endpoint = "https://price.jup.ag/v4/price"
            ids_param = ",".join(token_addresses)
            
            async with self.session.get(f"{jupiter_endpoint}?ids={ids_param}") as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch token prices: {await response.text()}")
                    return {}
                
                data = await response.json()
                result = {}
                
                if "data" in data:
                    for token_address, price_data in data["data"].items():
                        if "price" in price_data:
                            result[token_address] = float(price_data["price"])
                
                self._set_cache(cache_key, result)
                return result
                
        except Exception as e:
            logger.error(f"Error fetching token prices: {str(e)}")
            return {}
    
    async def get_token_volatility(self, token_addresses: List[str]) -> Dict[str, Dict[str, float]]:
        """
        Fetch token volatility metrics from Pyth or Switchboard
        
        Args:
            token_addresses: List of token mint addresses
            
        Returns:
            Dict mapping token addresses to volatility metrics
        """
        cache_key = f"volatility_{','.join(sorted(token_addresses))}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            # In a real implementation, this would call the Pyth API
            # For now, we'll simulate with reasonable volatility values
            result = {}
            
            for token_address in token_addresses:
                # Simulate volatility data
                # In production, this would use the Pyth price feed history
                result[token_address] = {
                    "volatility_1h": 1.2 + (hash(token_address) % 100) / 100,  # Random between 1.2-2.2%
                    "volatility_24h": 4.5 + (hash(token_address) % 500) / 100,  # Random between 4.5-9.5%
                    "price_change_24h": -3.0 + (hash(token_address) % 1000) / 100,  # -3% to +7%
                }
            
            self._set_cache(cache_key, result)
            return result
                
        except Exception as e:
            logger.error(f"Error fetching token volatility: {str(e)}")
            return {}
    
    async def get_token_liquidity(self, token_addresses: List[str]) -> Dict[str, float]:
        """
        Fetch token liquidity (TVL) from DEX APIs
        
        Args:
            token_addresses: List of token mint addresses
            
        Returns:
            Dict mapping token addresses to their liquidity in USD
        """
        cache_key = f"liquidity_{','.join(sorted(token_addresses))}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            # In a real implementation, this would query Raydium and Orca APIs
            # For now, we'll simulate with reasonable liquidity values
            result = {}
            
            for token_address in token_addresses:
                # Simulate liquidity data based on token address
                # In production, this would aggregate liquidity across DEXes
                base_liquidity = 10_000 + (hash(token_address) % 10_000_000)
                result[token_address] = base_liquidity
            
            self._set_cache(cache_key, result)
            return result
                
        except Exception as e:
            logger.error(f"Error fetching token liquidity: {str(e)}")
            return {}
    
    async def get_whale_concentration(self, token_addresses: List[str]) -> Dict[str, float]:
        """
        Calculate whale concentration score for tokens
        
        Args:
            token_addresses: List of token mint addresses
            
        Returns:
            Dict mapping token addresses to concentration scores (0-1)
        """
        cache_key = f"whale_{','.join(sorted(token_addresses))}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            # In a real implementation, this would analyze on-chain large holders
            # For now, we'll simulate with reasonable concentration values
            result = {}
            
            for token_address in token_addresses:
                # Simulate concentration score (0-1)
                # Higher values mean higher concentration (more risk)
                result[token_address] = 0.2 + (hash(token_address) % 80) / 100  # Between 0.2-1.0
            
            self._set_cache(cache_key, result)
            return result
                
        except Exception as e:
            logger.error(f"Error calculating whale concentration: {str(e)}")
            return {}
    
    async def get_all_token_data(self, wallet_address: str) -> Dict[str, Any]:
        """
        Fetch all required token data for risk assessment
        
        Args:
            wallet_address: Solana wallet address
            
        Returns:
            Dict containing all token data needed for risk assessment
        """
        # Get wallet balances
        wallet_data = await self.get_wallet_balances(wallet_address)
        
        if "error" in wallet_data:
            return wallet_data
        
        # Extract token addresses
        token_addresses = [token["mint"] for token in wallet_data.get("tokens", [])]
        
        # Add SOL to the token list
        sol_mint = "So11111111111111111111111111111111111111112"  # Native SOL wrapped address
        if wallet_data.get("sol_balance", 0) > 0 and sol_mint not in token_addresses:
            token_addresses.append(sol_mint)
            wallet_data["tokens"].append({
                "mint": sol_mint,
                "amount": wallet_data["sol_balance"]
            })
        
        # If no tokens found, return early
        if not token_addresses:
            return {
                "wallet_address": wallet_address,
                "tokens": [],
                "timestamp": datetime.now().isoformat()
            }
        
        # Fetch all required data in parallel
        metadata_task = self.get_token_metadata(token_addresses)
        prices_task = self.get_token_prices(token_addresses)
        volatility_task = self.get_token_volatility(token_addresses)
        liquidity_task = self.get_token_liquidity(token_addresses)
        whale_task = self.get_whale_concentration(token_addresses)
        txn_task = self.get_transaction_history(wallet_address)
        
        metadata, prices, volatility, liquidity, whale_concentration, transactions = await asyncio.gather(
            metadata_task, prices_task, volatility_task, liquidity_task, whale_task, txn_task
        )
        
        # Calculate token age from transaction history
        token_age = self._calculate_token_age(wallet_address, transactions, token_addresses)
        
        # Combine all data
        total_value_usd = 0
        token_data = []
        
        for token in wallet_data["tokens"]:
            mint = token["mint"]
            amount = token["amount"]
            price = prices.get(mint, 0)
            value_usd = amount * price
            
            token_info = {
                "mint": mint,
                "symbol": metadata.get(mint, {}).get("symbol", "UNKNOWN"),
                "name": metadata.get(mint, {}).get("name", "Unknown Token"),
                "amount": amount,
                "price_usd": price,
                "value_usd": value_usd,
                "volatility_1h": volatility.get(mint, {}).get("volatility_1h", 0),
                "volatility_24h": volatility.get(mint, {}).get("volatility_24h", 0),
                "price_change_24h": volatility.get(mint, {}).get("price_change_24h", 0),
                "liquidity_usd": liquidity.get(mint, 0),
                "centralized_score": whale_concentration.get(mint, 0.5),
                "age_days": token_age.get(mint, 0)
            }
            
            token_data.append(token_info)
            total_value_usd += value_usd
        
        # Calculate portfolio percentages
        if total_value_usd > 0:
            for token in token_data:
                token["portfolio_percentage"] = (token["value_usd"] / total_value_usd) * 100
        
        result = {
            "wallet_address": wallet_address,