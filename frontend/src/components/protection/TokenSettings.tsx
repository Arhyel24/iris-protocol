
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { updateTokenProtection } from "@/services/protectionService";
import { sendNotification } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";

interface TokenItem {
  id: string;
  symbol: string;
  name: string;
  riskScore: number;
  isProtected: boolean;
  thresholdValue: number;
  balance: string;
  value: string;
}

const TokenSettings: React.FC<{ tokens: TokenItem[] }> = ({ tokens }) => {
  const [tokenSettings, setTokenSettings] = useState(tokens);
  const [savingTokens, setSavingTokens] = useState<{[key: string]: boolean}>({});
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSlider = async (idx: number, value: number) => {
    const token = tokenSettings[idx];
    setSavingTokens(prev => ({ ...prev, [token.id]: true }));
    
    try {
      setTokenSettings((prev) => {
        const copy = [...prev];
        copy[idx].thresholdValue = value;
        return copy;
      });
      
      const { error } = await updateTokenProtection(token.id, {
        risk_threshold: value
      });
      
      if (error) throw error;
      
    } catch (err) {
      console.error("Error updating token threshold:", err);
      toast({
        title: "Error",
        description: "Failed to update protection threshold",
        variant: "destructive"
      });
      
      // Revert the change in UI
      setTokenSettings((prev) => {
        const copy = [...prev];
        copy[idx].thresholdValue = tokens[idx].thresholdValue;
        return copy;
      });
    } finally {
      setSavingTokens(prev => ({ ...prev, [token.id]: false }));
    }
  };

  const handleToggle = async (idx: number, checked: boolean) => {
    const token = tokenSettings[idx];
    setSavingTokens(prev => ({ ...prev, [token.id]: true }));
    
    try {
      setTokenSettings((prev) => {
        const copy = [...prev];
        copy[idx].isProtected = checked;
        return copy;
      });
      
      const { error } = await updateTokenProtection(token.id, {
        is_protected: checked
      });
      
      if (error) throw error;
      
      toast({
        title: `${token.symbol} protection ${checked ? 'enabled' : 'disabled'}`,
        description: checked 
          ? `${token.symbol} is now protected based on your risk threshold` 
          : `${token.symbol} protection has been turned off`
      });
      
      // Send notification if protection is disabled
      if (!checked && user?.email) {
        sendNotification(user.email, {
          type: 'protectionDisabled',
          data: {
            asset: token.symbol
          }
        });
      }
      
    } catch (err) {
      console.error("Error toggling token protection:", err);
      toast({
        title: "Error",
        description: "Failed to update protection status",
        variant: "destructive"
      });
      
      // Revert the change in UI
      setTokenSettings((prev) => {
        const copy = [...prev];
        copy[idx].isProtected = tokens[idx].isProtected;
        return copy;
      });
    } finally {
      setSavingTokens(prev => ({ ...prev, [token.id]: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tokenSettings.map((token, idx) => {
        const isActive = token.symbol === "SOL";
        
        return (
          <Card key={token.id} className="glass-card border-none relative shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="font-orbitron text-white">{token.symbol}</CardTitle>
                  {!isActive && (
                    <Badge variant="outline" className="bg-secondary text-muted-foreground text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={token.isProtected}
                  onCheckedChange={(checked) => handleToggle(idx, checked)}
                  id={`protection-switch-${token.symbol}`}
                  disabled={savingTokens[token.id] || !isActive}
                />
              </div>
              <div className="text-muted-foreground">{token.name}</div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm text-white/80">Balance: {token.balance}</div>
              <div className="mb-5 text-xs text-muted-foreground">Current Value: {token.value}</div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">Risk Threshold</span>
                <span className="font-medium text-iris-purple">{token.thresholdValue}</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[token.thresholdValue]}
                onValueChange={([val]) => {
                  setTokenSettings((prev) => {
                    const copy = [...prev];
                    copy[idx].thresholdValue = val;
                    return copy;
                  });
                }}
                onValueCommit={([val]) => handleSlider(idx, val)}
                disabled={savingTokens[token.id] || !isActive}
              />
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-iris-dark/95 to-transparent flex items-center justify-center pointer-events-none">
                  <div className="p-4 rounded-md text-center">
                    <p className="text-white font-medium">Coming Soon</p>
                    <p className="text-white/60 text-sm mt-1">Protection for {token.symbol} is under development</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
};

export default TokenSettings;
