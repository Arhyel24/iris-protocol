"use client"


import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RiskSettings from "@/components/protection/RiskSettings";
import TokenSettings from "@/components/protection/TokenSettings";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getUserProtectionSettings, getGlobalProtectionSettings, initializeProtectionSettings } from "@/services/protectionService";

const Protection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tokenSettings, setTokenSettings] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  
  useEffect(() => {
    const fetchProtectionSettings = async () => {
      setLoading(true);
      
      try {
        // Initialize protection settings if needed
        await initializeProtectionSettings();
        
        // Fetch token-specific settings
        const { data: tokenData } = await getUserProtectionSettings();
        if (tokenData) {
          setTokenSettings(tokenData);
        }
        
        // Fetch global settings
        const { data: globalData } = await getGlobalProtectionSettings();
        if (globalData) {
          setGlobalSettings(globalData);
        }
      } catch (err) {
        console.error("Error fetching protection settings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProtectionSettings();
  }, []);
  
  // Convert database settings to the format expected by components
  const formatTokenSettings = () => {
    if (!tokenSettings.length) return [];
    
    return tokenSettings.map(setting => ({
      symbol: setting.token_symbol,
      name: setting.token_name,
      balance: setting.token_symbol === "SOL" ? "120.45 SOL" : "Coming Soon",
      value: setting.token_symbol === "SOL" ? "$15,658.50" : "Coming Soon",
      riskScore: setting.token_symbol === "SOL" ? 35 : 0,
      isProtected: setting.is_protected,
      thresholdValue: setting.risk_threshold,
      id: setting.id
    }));
  };
  
  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-2xl font-orbitron font-bold text-white mt-4 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Protection Settings
          </motion.h1>
          
          {loading ? (
            <div className="space-y-6">
              <div className="animate-pulse rounded-lg bg-slate-700/30 h-40 w-full"></div>
              <div className="animate-pulse rounded-lg bg-slate-700/30 h-80 w-full"></div>
            </div>
          ) : (
            <>
              <Alert className="bg-iris-darker border border-iris-yellow/20">
                <AlertCircle className="h-4 w-4 text-iris-yellow" />
                <AlertTitle className="text-white">Beta Feature</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Most protection features are still in development. Currently, only SOL protection is fully enabled.
                </AlertDescription>
              </Alert>
              
              <RiskSettings 
                initialSettings={globalSettings}
              />
              
              <TokenSettings 
                tokens={formatTokenSettings()} 
              />
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Protection;
