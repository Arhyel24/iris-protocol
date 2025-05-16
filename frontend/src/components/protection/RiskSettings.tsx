
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { updateGlobalProtection } from "@/services/protectionService";
import { sendNotification } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";

interface RiskSettingsProps {
  initialSettings?: {
    portfolio_threshold: number;
    auto_swap: boolean;
    notifications: boolean;
  } | null;
}

const RiskSettings: React.FC<RiskSettingsProps> = ({ initialSettings }) => {
  const [portfolioThreshold, setPortfolioThreshold] = useState(initialSettings?.portfolio_threshold || 50);
  const [autoSwap, setAutoSwap] = useState(initialSettings?.auto_swap !== undefined ? initialSettings.auto_swap : true);
  const [notifications, setNotifications] = useState(initialSettings?.notifications !== undefined ? initialSettings.notifications : true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (initialSettings) {
      setPortfolioThreshold(initialSettings.portfolio_threshold);
      setAutoSwap(initialSettings.auto_swap);
      setNotifications(initialSettings.notifications);
    }
  }, [initialSettings]);
  
  const saveSettings = async (key: string, value: any) => {
    setIsSaving(true);
    
    try {
      let updates = {};
      
      if (key === 'portfolio_threshold') {
        updates = { portfolio_threshold: value };
      } else if (key === 'auto_swap') {
        updates = { auto_swap: value };
      } else if (key === 'notifications') {
        updates = { notifications: value };
      }
      
      const { error } = await updateGlobalProtection(updates);
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your protection settings have been updated."
      });
      
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePortfolioThresholdChange = async (values: number[]) => {
    const newValue = values[0];
    setPortfolioThreshold(newValue);
    await saveSettings('portfolio_threshold', newValue);
  };
  
  const handleAutoSwapChange = async (value: boolean) => {
    setAutoSwap(value);
    await saveSettings('auto_swap', value);
    
    // Send notification if protection is disabled
    if (!value && user?.email) {
      sendNotification(user.email, {
        type: 'protectionDisabled',
        data: {
          asset: 'Auto-Swap'
        }
      });
    }
  };
  
  const handleNotificationsChange = async (value: boolean) => {
    setNotifications(value);
    await saveSettings('notifications', value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card border-none shadow-lg mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">General Risk Settings</CardTitle>
          <CardDescription>Adjust your overall portfolio protection preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">Max Portfolio Risk Threshold</span>
                <span className="font-medium text-iris-purple">{portfolioThreshold}</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[portfolioThreshold]}
                onValueChange={(values) => setPortfolioThreshold(values[0])}
                onValueCommit={handlePortfolioThresholdChange}
                disabled={isSaving}
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-12 mt-8">
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={autoSwap} 
                  onCheckedChange={handleAutoSwapChange}
                  id="auto-swap-switch"
                  disabled={isSaving}
                />
                <label htmlFor="auto-swap-switch" className="text-white">Auto-Swap on High Risk</label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={notifications} 
                  onCheckedChange={handleNotificationsChange} 
                  id="notif-switch"
                  disabled={isSaving}
                />
                <label htmlFor="notif-switch" className="text-white">Risk Alert Notifications</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RiskSettings;
