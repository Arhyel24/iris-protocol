"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeftRight, ChevronLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import RiskBadge from "@/components/RiskBadge";
import { useToast } from "@/hooks/use-toast";

const generatePriceHistory = (basePrice: number, days: number) => {
  const data = [];
  let price = basePrice;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const change = (Math.random() * 0.1 - 0.05) * basePrice;
    price += change;
    price = Math.max(price, basePrice * 0.7);
    data.push({ date: formattedDate, price: price.toFixed(6) });
  }
  return data;
};

const generateTransactionHistory = (symbol: string) => {
  const types = ["buy", "sell", "swap", "protection"];
  const history = [];
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const type = types[Math.floor(Math.random() * types.length)];
    let description = "";
    switch (type) {
      case "buy":
        description = `Purchased ${(Math.random() * 50).toFixed(2)} ${symbol}`;
        break;
      case "sell":
        description = `Sold ${(Math.random() * 20).toFixed(2)} ${symbol}`;
        break;
      case "swap":
        const otherTokens = ["SOL", "USDC", "JTO", "BONK"].filter(t => t !== symbol);
        const otherToken = otherTokens[Math.floor(Math.random() * otherTokens.length)];
        description = `Swapped ${(Math.random() * 10).toFixed(2)} ${symbol} for ${(Math.random() * 100).toFixed(2)} ${otherToken}`;
        break;
      case "protection":
        description = Math.random() > 0.5 ? `Protection enabled for ${symbol}` : `Protection disabled for ${symbol}`;
        break;
    }
    history.push({
      id: `tx-${i}`,
      date: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      type,
      description
    });
  }
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const tokens = [
  { symbol: "SOL", name: "Solana", balance: "120.45 SOL", value: "$15,658.50", change: 3.2, riskScore: 35, protected: true, price: 130.0, description: "Solana is a highly performant..." },
  { symbol: "USDC", name: "USD Coin", balance: "5,430 USDC", value: "$5,430.00", change: 0.1, riskScore: 5, protected: true, price: 1.0, description: "USDC is a fully-collateralized..." },
  { symbol: "JTO", name: "Jito", balance: "843.2 JTO", value: "$4,216.00", change: -1.5, riskScore: 48, protected: true, price: 5.0, description: "Jito is a suite of infrastructure..." },
  { symbol: "BONK", name: "Bonk", balance: "15,000,000 BONK", value: "$3,750.00", change: 5.8, riskScore: 72, protected: false, price: 0.00025, description: "BONK is a dog-themed meme token..." },
  { symbol: "PYTH", name: "Pyth Network", balance: "1,200 PYTH", value: "$2,400.00", change: -0.5, riskScore: 42, protected: false, price: 2.0, description: "Pyth is a first-party financial oracle..." }
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-iris-darker p-3 border border-iris-purple/30 rounded-lg shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-white">Price: ${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const TokenDetails = () => {
  const params = useParams();
    const { toast } = useToast();
    const router = useRouter()
  const tokenDataInit = tokens.find(t => t.symbol === params?.symbol) || tokens[0];
  const [tokenData, setTokenData] = useState(tokenDataInit);

  const priceHistory = generatePriceHistory(tokenData.price, 30);
    const transactionHistory = generateTransactionHistory(tokenData.symbol);
    
const getTransactionBadge = (type: string) => {
  const styles: Record<string, string> = {
    buy: "bg-iris-green/20 text-iris-green border-iris-green/30",
    sell: "bg-iris-red/20 text-iris-red border-iris-red/30",
    swap: "bg-iris-blue/20 text-iris-blue border-iris-blue/30",
    protection: "bg-iris-purple/20 text-iris-purple-light border-iris-purple/30"
  };

  const badgeStyle = styles[type] || "border";

  return (
    <Badge className={badgeStyle}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

  const toggleProtection = () => {
    setTokenData(prev => {
      const updated = { ...prev, protected: !prev.protected };
      toast({
        title: updated.protected ? "Protection Enabled" : "Protection Disabled",
        description: `${updated.symbol} is now ${updated.protected ? "protected" : "unprotected"}.`,
        variant: updated.protected ? "default" : "destructive"
      });
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="mb-6 flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-iris-purple/20"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-orbitron font-bold text-white">{tokenData.name} ({tokenData.symbol})</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="glass-card p-6 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">{tokenData.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-secondary">{tokenData.symbol}</Badge>
                  <RiskBadge score={tokenData.riskScore} size="sm" />
                  {tokenData.protected ? (
                    <Badge className="bg-iris-purple/20 text-iris-purple-light border-iris-purple/30">
                      Protected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Unprotected</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-white">${tokenData.price.toFixed(2)}</div>
                <div className={`text-sm ${tokenData.change >= 0 ? "text-iris-green" : "text-iris-red"}`}>
                  {tokenData.change >= 0 ? "+" : ""}{tokenData.change}%
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">{tokenData.description}</p>
            
            <div className="flex gap-3 mb-6">
              <Button 
                className="neo-button flex-1"
                onClick={() => router.replace(`/swap?from=${tokenData.symbol}`)}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" /> Swap
              </Button>
              <Button 
                variant="outline" 
                className="border-iris-purple/30 hover:bg-iris-purple/10 flex-1"
                onClick={toggleProtection}
              >
                <Shield className="mr-2 h-4 w-4 text-iris-purple" /> {tokenData.protected ? "Disable" : "Enable"} Protection
              </Button>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Price History (30 days)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="url(#colorPrice)" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 5, fill: "#1EAEDB", strokeWidth: 0 }}
                    />
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#9B87F5" />
                        <stop offset="100%" stopColor="#1EAEDB" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="glass-card border-none shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Token Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium text-white">{tokenData.balance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-medium text-white">{tokenData.value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="font-medium text-white">{tokenData.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protection</span>
                  <span className="font-medium text-white">{tokenData.protected ? "Enabled" : "Disabled"}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionHistory.slice(0, 5).map(tx => (
                    <div key={tx.id} className="border-b border-muted pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          {getTransactionBadge(tx.type)}
                          <span className="text-sm text-white">{tx.description}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{tx.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Transaction History</CardTitle>
            <CardDescription className="text-muted-foreground">All transactions related to {tokenData.symbol}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="data-grid">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>{getTransactionBadge(tx.type)}</td>
                      <td>{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TokenDetails;
