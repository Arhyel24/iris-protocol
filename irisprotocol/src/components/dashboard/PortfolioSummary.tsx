
import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RiskBadge from "../RiskBadge";

interface PortfolioSummaryProps {
  walletAddress: string;
  riskScore: number;
  portfolioValue: string;
  portfolioChange: number;
  riskHistory: {
    date: string;
    score: number;
  }[];
}

const formatWalletAddress = (address: string) => {
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-iris-darker p-3 border border-iris-purple/30 rounded-lg shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-white">Risk Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const statVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  walletAddress,
  riskScore,
  portfolioValue,
  portfolioChange,
  riskHistory
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const { toast } = useToast();
  const [showFullAddress, setShowFullAddress] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard"
    });
  };

  const openExplorer = () => {
    window.open(`https://solscan.io/account/${walletAddress}`, '_blank');
  };

  return (
    <div ref={ref}>
      <AnimatePresence>
        {isInView && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={statVariant}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10" // Increased mb-8 to mb-10 for more spacing
          >
            <div className="glass-card flex flex-col items-start p-6">
              <div className="text-xs text-muted-foreground mb-2">Portfolio Value</div>
              <div className="text-3xl font-orbitron font-bold text-white">{portfolioValue}</div>
              <div className={`text-md ${portfolioChange >= 0 ? "text-iris-green" : "text-iris-red"} mt-1`}>
                {portfolioChange >= 0 ? "+" : ""}
                {portfolioChange}%
              </div>
            </div>
            <div className="glass-card flex flex-col items-start p-6">
              <div className="text-xs text-muted-foreground mb-2">Risk Score</div>
              <div className="text-3xl font-orbitron font-bold text-white">{riskScore}</div>
            </div>
            <div className="glass-card flex flex-col items-start p-6">
              <div className="text-xs text-muted-foreground mb-2">Wallet Address</div>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="text-md font-mono break-all text-white cursor-pointer hover:text-iris-purple-light"
                  onClick={() => setShowFullAddress(!showFullAddress)}
                >
                  {showFullAddress ? walletAddress : formatWalletAddress(walletAddress)}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 p-0 bg-transparent hover:bg-iris-purple/10" 
                  onClick={copyToClipboard}
                  title="Copy address"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 p-0 bg-transparent hover:bg-iris-purple/10" 
                  onClick={openExplorer}
                  title="View on Solscan"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-white">Portfolio Overview</CardTitle>
              <CardDescription className="text-muted-foreground">
                Wallet {formatWalletAddress(walletAddress)}
              </CardDescription>
            </div>
            <RiskBadge score={riskScore} size="lg" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
            <div className="flex items-end">
              <h3 className="text-3xl font-orbitron font-semibold text-white">{portfolioValue}</h3>
              <span className={`ml-2 text-sm ${portfolioChange >= 0 ? 'text-iris-green' : 'text-iris-red'}`}>
                {portfolioChange >= 0 ? '+' : ''}{portfolioChange}%
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Risk Score (7-day)</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="url(#colorScore)" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: "#9B87F5", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#1EAEDB", strokeWidth: 0 }}
                  />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9B87F5" />
                      <stop offset="100%" stopColor="#1EAEDB" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
