
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeftRight, ActivityIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserProtectionSettings, updateTokenProtection } from "@/services/protectionService";
import { sendNotification } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import RiskBadge from "../RiskBadge";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change: number;
  riskScore: number;
  protected: boolean;
  id?: string; // Protection setting ID if available
}

interface TokenListProps {
  tokens: Token[];
}

const TokenList: React.FC<TokenListProps> = ({ tokens: initialTokens }) => {
  const [tokens, setTokens] = useState(initialTokens);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadProtectionSettings();
  }, []);

  const loadProtectionSettings = async () => {
    setLoading(true);
    try {
      const { data } = await getUserProtectionSettings();
      
      if (data && data.length > 0) {
        // Map protection settings to tokens
        const updatedTokens = initialTokens.map(token => {
          const setting = data.find(s => s.token_symbol === token.symbol);
          if (setting) {
            return {
              ...token,
              protected: setting.is_protected,
              id: setting.id // Store the protection setting ID for updates
            };
          }
          return token;
        });
        setTokens(updatedTokens);
      }
    } catch (error) {
      console.error("Error loading protection settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProtection = async (index: number) => {
    const token = tokens[index];
    const newProtectionStatus = !token.protected;
    
    // Only allow toggling protection for SOL (for now)
    if (token.symbol !== "SOL") {
      toast({
        title: "Coming Soon",
        description: `Protection for ${token.symbol} is under development`,
        variant: "default"
      });
      return;
    }
    
    if (!token.id) {
      toast({
        title: "Error",
        description: "Protection setting not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await updateTokenProtection(token.id, {
        is_protected: newProtectionStatus
      });
      
      if (error) throw error;
      
      // Update local state
      setTokens(prev => {
        const updated = [...prev];
        updated[index].protected = newProtectionStatus;
        return updated;
      });
      
      // Show success message
      toast({
        title: newProtectionStatus ? "Protection enabled" : "Protection removed",
        description: `${token.symbol} is now ${newProtectionStatus ? "protected" : "unprotected"}`,
        variant: newProtectionStatus ? "default" : "destructive"
      });
      
      // Send notification if protection is disabled
      if (!newProtectionStatus && user?.email) {
        sendNotification(user.email, {
          type: 'protectionDisabled',
          data: {
            asset: token.symbol
          }
        });
      }
    } catch (error) {
      console.error("Error updating protection:", error);
      toast({
        title: "Error",
        description: "Failed to update protection status",
        variant: "destructive"
      });
    }
  };

  const handleSwap = (token: Token) => {
    router.replace(`/swap?from=${token.symbol}`);
  };

  const viewTokenHistory = (token: Token) => {
    router.replace(`/token/${token.symbol}`);
  };

  return (
    <Card className="glass-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Token Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="data-grid">
            <thead>
              <tr>
                <th>Token</th>
                <th>Balance</th>
                <th>Value</th>
                <th>24h</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => {
                // Determine if protection is available (currently only SOL)
                const isProtectionAvailable = token.symbol === "SOL";
                
                return (
                  <tr key={token.symbol}>
                    <td>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-iris-purple/30 to-iris-blue/30 flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold">{token.symbol.substring(0, 1)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>{token.balance}</td>
                    <td>{token.value}</td>
                    <td className={token.change >= 0 ? "text-iris-green" : "text-iris-red"}>
                      {token.change >= 0 ? "+" : ""}{token.change}%
                    </td>
                    <td><RiskBadge score={token.riskScore} size="sm" showText={false} /></td>
                    <td>
                      {token.protected ? (
                        <Badge className="bg-iris-purple/20 text-iris-purple-light border-iris-purple/30 py-0.5 px-2">
                          Protected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="py-0.5 px-2">
                          Unprotected
                        </Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={`h-8 w-8 p-0 ${token.protected ? "bg-iris-purple/10" : ""} ${!isProtectionAvailable ? "opacity-50" : ""}`}
                          title={token.protected ? "Remove protection" : "Protect"}
                          onClick={() => toggleProtection(index)}
                          disabled={loading || !isProtectionAvailable}
                        >
                          <Shield className={`h-4 w-4 ${token.protected ? "text-iris-purple-light" : "text-iris-purple"}`} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          title="Swap"
                          onClick={() => handleSwap(token)}
                        >
                          <ArrowLeftRight className="h-4 w-4 text-iris-blue" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          title="History"
                          onClick={() => viewTokenHistory(token)}
                        >
                          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenList;
