"use client"

import React, { useEffect, useState } from "react";
import { Shield, Coins, ActivityIcon } from "lucide-react";
import { getProtocolStats, getRecentProtectionEvents, ProtocolStats, ProtectionEvent } from "@/services/protocolStatsService";

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  isLoading?: boolean;
}> = ({ icon, title, value, change, positive, isLoading = false }) => {
  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <div className="text-iris-purple">{icon}</div>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 bg-iris-darker/40 rounded animate-pulse"></div>
          <div className="h-4 w-28 bg-iris-darker/40 rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          <p className="text-3xl font-orbitron font-semibold text-white mb-1">{value}</p>
          {change && (
            <p className={`text-xs ${positive ? "text-iris-green" : "text-iris-red"} flex items-center`}>
              {positive ? "+" : "-"}{change} 
              <span className="ml-1 text-muted-foreground">in last 24h</span>
            </p>
          )}
        </>
      )}
    </div>
  );
};

const LiveStats: React.FC = () => {
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [events, setEvents] = useState<ProtectionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const protocolStats = await getProtocolStats();
        const protectionEvents = await getRecentProtectionEvents();
        
        setStats(protocolStats);
        setEvents(protectionEvents);
      } catch (error) {
        console.error("Error fetching live stats:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Function to determine badge style based on action
  const getBadgeClass = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'hedged': 
        return 'badge-medium';
      case 'swapped': 
        return 'badge-high';
      case 'alert': 
        return 'badge-low';
      default: 
        return 'badge-medium';
    }
  };

  return (
    <div className="py-20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-iris-blue/10 rounded-full filter blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-iris-purple/10 rounded-full filter blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-iris-purple to-iris-blue">
              Live Protocol Stats
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time analytics of the IRIS protocol's performance and security measures.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Coins size={24} />}
            title="Total Value Protected"
            value={stats?.totalValueProtected || ""}
            change="12.4%"
            positive={true}
            isLoading={loading}
          />
          
          <StatCard 
            icon={<Shield size={24} />}
            title="Protected Wallets"
            value={stats ? stats.protectedWallets.toString() : ""}
            change="105"
            positive={true}
            isLoading={loading}
          />
          
          <StatCard 
            icon={<ActivityIcon size={24} />}
            title="Protections Triggered"
            value={stats ? stats.protectionsTriggered.toString() : ""}
            change="8"
            positive={true}
            isLoading={loading}
          />
        </div>
        
        <div className="mt-12 glass-card p-6">
          <h3 className="font-medium text-white mb-6">Recent Protection Events</h3>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-12 bg-iris-darker/40 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-grid">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Asset</th>
                    <th>Action</th>
                    <th>Amount</th>
                    <th>Value Secured</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={index}>
                      <td className="text-sm">{event.time}</td>
                      <td className="font-medium">{event.asset}</td>
                      <td><span className={`badge-${getBadgeClass(event.action)}`}>{event.action}</span></td>
                      <td>{event.amount}</td>
                      <td className="text-iris-green">{event.valueSecured}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStats;
