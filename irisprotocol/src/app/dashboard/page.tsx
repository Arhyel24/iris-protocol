"use client"


import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import TokenList from "@/components/dashboard/TokenList";
import RecentNotifications from "@/components/dashboard/RecentNotifications";
import { supabase } from "@/integrations/supabase/client";

const Dashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sample data
  const walletData = {
    address: "8TcXXuMWh1zfZYGhzNnxDjNUEq4EmZ3UpMK6UvTaRDTH",
    riskScore: 42,
    portfolioValue: "$32,458.67",
    portfolioChange: 2.4,
    riskHistory: [
      { date: "Apr 13", score: 28 },
      { date: "Apr 14", score: 32 },
      { date: "Apr 15", score: 35 },
      { date: "Apr 16", score: 30 },
      { date: "Apr 17", score: 45 },
      { date: "Apr 18", score: 55 },
      { date: "Apr 19", score: 42 },
    ]
  };
  
  const tokens = [
    {
      symbol: "SOL",
      name: "Solana",
      balance: "120.45 SOL",
      value: "$15,658.50",
      change: 3.2,
      riskScore: 35,
      protected: true
    },
    {
      symbol: "JTO",
      name: "Jito",
      balance: "843.2 JTO",
      value: "$4,216.00",
      change: -1.5,
      riskScore: 48,
      protected: false
    },
    {
      symbol: "BONK",
      name: "Bonk",
      balance: "15,000,000 BONK",
      value: "$3,750.00",
      change: 5.8,
      riskScore: 72,
      protected: false
    },
    {
      symbol: "PYTH",
      name: "Pyth Network",
      balance: "1,200 PYTH",
      value: "$2,400.00",
      change: -0.5,
      riskScore: 42,
      protected: false
    }
  ];
  
  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="space-y-8">
          <h1 className="text-2xl font-orbitron font-bold text-white mt-4 mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PortfolioSummary 
                walletAddress={walletData.address}
                riskScore={walletData.riskScore}
                portfolioValue={walletData.portfolioValue}
                portfolioChange={walletData.portfolioChange}
                riskHistory={walletData.riskHistory}
              />
            </div>
            <div className="lg:col-span-1">
              <RecentNotifications 
                notifications={notifications} 
                loading={loading}
              />
            </div>
          </div>
          
          <div>
            <TokenList tokens={tokens} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
