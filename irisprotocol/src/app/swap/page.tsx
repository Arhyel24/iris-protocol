"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RiskBadge from "@/components/RiskBadge";

const Swap = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFromToken = searchParams.get('from') || 'SOL';
  const { toast } = useToast();

  const [fromToken, setFromToken] = useState(initialFromToken);
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [priceImpact, setPriceImpact] = useState("0.05");
  const [conversionRate, setConversionRate] = useState("1.0");
  const [loading, setLoading] = useState(false);

  const tokens = [
    { symbol: "SOL", name: "Solana", balance: "120.45", price: 130.0, riskScore: 35 },
    { symbol: "USDC", name: "USD Coin", balance: "5,430", price: 1.0, riskScore: 5 },
    { symbol: "JTO", name: "Jito", balance: "843.2", price: 5.0, riskScore: 48 },
    { symbol: "BONK", name: "Bonk", balance: "15,000,000", price: 0.00025, riskScore: 72 },
    { symbol: "PYTH", name: "Pyth Network", balance: "1,200", price: 2.0, riskScore: 42 }
  ];

  useEffect(() => {
    if (fromAmount) {
      setLoading(true);
      const timeoutId = setTimeout(() => {
        const fromTokenObj = tokens.find(t => t.symbol === fromToken);
        const toTokenObj = tokens.find(t => t.symbol === toToken);

        if (fromTokenObj && toTokenObj) {
          const calculatedAmount = (parseFloat(fromAmount) * fromTokenObj.price / toTokenObj.price).toFixed(6);
          setToAmount(calculatedAmount);

          const rate = (fromTokenObj.price / toTokenObj.price).toFixed(6);
          setConversionRate(rate);

          const randomImpact = (Math.random() * 0.1 + 0.01).toFixed(2);
          setPriceImpact(randomImpact);
        }
        setLoading(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setToAmount("");
      setLoading(false);
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const setPercentageAmount = (percentage: number) => {
    const fromTokenObj = tokens.find(t => t.symbol === fromToken);
    if (fromTokenObj) {
      const balance = parseFloat(fromTokenObj.balance.replace(/,/g, ''));
      const amount = (balance * (percentage / 100)).toFixed(6);
      setFromAmount(amount);
    }
  };

  const executeSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive"
      });
      return;
    }

    const fromTokenObj = tokens.find(t => t.symbol === fromToken);
    if (fromTokenObj && parseFloat(fromAmount) > parseFloat(fromTokenObj.balance.replace(',', ''))) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${fromToken} to complete this swap`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast({
        title: "Swap executed",
        description: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
      });
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 1500);
  };

  const getTokenBySymbol = (symbol: string) => tokens.find(t => t.symbol === symbol) || tokens[0];

  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-orbitron font-bold text-white mb-6 mt-4">Swap Tokens</h1>
          
          <Card className="glass-card border-none shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-iris-purple/10">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <ArrowLeftRight className="mr-2 h-5 w-5 text-iris-purple-light" /> 
                Token Swap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* From Token */}
              <div className="space-y-2 bg-iris-darker/30 p-4 rounded-lg border border-iris-purple/10">
                <div className="flex justify-between">
                  <Label htmlFor="from-token" className="text-white font-medium">From</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {getTokenBySymbol(fromToken).balance} {fromToken}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="w-1/3 bg-iris-darker border-iris-purple/20">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent className="bg-iris-darker border border-iris-purple/20">
                      {tokens.map(token => (
                        <SelectItem 
                          key={token.symbol} 
                          value={token.symbol}
                          disabled={token.symbol === toToken}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-iris-purple/50 to-iris-blue/50 flex items-center justify-center">
                              <span className="text-[10px] font-medium">{token.symbol.substring(0, 1)}</span>
                            </div>
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative w-2/3">
                    <Input
                      id="from-amount"
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-iris-darker border-iris-purple/20 pr-16"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-iris-purple/10 border-iris-purple/20 hover:bg-iris-purple/20"
                      onClick={() => setPercentageAmount(percent)}
                    >
                      {percent === 100 ? 'MAX' : `${percent}%`}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm text-muted-foreground">
                    {getTokenBySymbol(fromToken).name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white/70">Risk:</span>
                    <RiskBadge score={getTokenBySymbol(fromToken).riskScore} size="sm" showText={false} />
                  </div>
                </div>
              </div>
              
              {/* Swap Direction Button */}
              <div className="flex justify-center my-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-iris-purple/20 border-iris-purple/30 hover:bg-iris-purple/30 transition-all"
                  onClick={handleSwapTokens}
                >
                  <div className="relative">
                    <ArrowUp className="h-4 w-4 text-iris-purple-light absolute -top-2" />
                    <ArrowDown className="h-4 w-4 text-iris-purple-light absolute -bottom-2" />
                  </div>
                </Button>
              </div>
              
              {/* To Token */}
              <div className="space-y-2 bg-iris-darker/30 p-4 rounded-lg border border-iris-purple/10">
                <div className="flex justify-between">
                  <Label htmlFor="to-token" className="text-white font-medium">To</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {getTokenBySymbol(toToken).balance} {toToken}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-1/3 bg-iris-darker border-iris-purple/20">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent className="bg-iris-darker border border-iris-purple/20">
                      {tokens.map(token => (
                        <SelectItem 
                          key={token.symbol} 
                          value={token.symbol}
                          disabled={token.symbol === fromToken}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-iris-purple/50 to-iris-blue/50 flex items-center justify-center">
                              <span className="text-[10px] font-medium">{token.symbol.substring(0, 1)}</span>
                            </div>
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative w-2/3">
                    <Input
                      id="to-amount"
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-iris-darker border-iris-purple/20"
                      value={toAmount}
                      readOnly
                    />
                    {loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <RefreshCw className="h-4 w-4 text-iris-purple animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-muted-foreground">
                    {getTokenBySymbol(toToken).name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/70">Risk:</span>
                    <RiskBadge score={getTokenBySymbol(toToken).riskScore} size="sm" showText={false} />
                  </div>
                </div>
              </div>
              
              {/* Exchange Rate & Details */}
              <div className="bg-iris-darker/30 p-4 rounded-lg space-y-3 text-sm border border-iris-purple/10">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="text-white">1 {fromToken} = {conversionRate} {toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={parseFloat(priceImpact) > 5 ? "text-iris-red" : "text-iris-yellow"}>
                    {priceImpact}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-white">0.00025 SOL</span>
                </div>
                {parseFloat(priceImpact) > 3 && (
                  <div className="text-xs text-iris-yellow bg-iris-yellow/10 p-2 rounded">
                    ⚠️ Higher than normal price impact. Consider swapping a smaller amount.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-iris-purple/10 pt-4">
              <Button 
                className="neo-button w-full py-6"
                onClick={executeSwap}
                disabled={!fromAmount || parseFloat(fromAmount) <= 0 || loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="mr-2 h-4 w-4" /> Swap Tokens
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Swap;