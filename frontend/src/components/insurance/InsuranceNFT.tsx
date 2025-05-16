
import React from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export type TierType = "Basic" | "Pro" | "Premium";

interface InsuranceNFTProps {
  tier: TierType;
  maxPayout: string;
  expiry: string;
  isActive?: boolean;
}

const InsuranceNFT: React.FC<InsuranceNFTProps> = ({ tier, maxPayout, expiry, isActive = true }) => {
  const tierStyles = {
    Basic: {
      gradient: "bg-gradient-to-br from-iris-blue/80 to-iris-purple/80",
      icon: <Shield className="h-5 w-5 text-white" />,
      borderColor: "border-iris-blue/30"
    },
    Pro: {
      gradient: "bg-gradient-to-br from-iris-purple/80 to-[#A265F0]/80",
      icon: <ShieldCheck className="h-5 w-5 text-white" />,
      borderColor: "border-iris-purple/30"
    },
    Premium: {
      gradient: "bg-gradient-to-br from-[#9681EB]/80 to-[#6527BE]/80",
      icon: <ShieldCheck className="h-5 w-5 text-white" />,
      borderColor: "border-[#6527BE]/30"
    }
  };
  
  const style = tierStyles[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center"
    >
      <div className={`relative w-full max-w-md aspect-[3/4] rounded-2xl border-2 ${style.borderColor} overflow-hidden shadow-xl`}>
        <div className={`absolute inset-0 ${style.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        
        <div className="relative h-full p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-white/20 mr-2">
                {style.icon}
              </div>
              <span className="text-white font-orbitron font-bold">{tier} Protection</span>
            </div>
            
            <Badge className={`${isActive 
              ? "bg-iris-green/20 text-iris-green" 
              : "bg-iris-red/20 text-iris-red"}`}>
              {isActive ? "Active" : "Expired"}
            </Badge>
          </div>
          
          {/* NFT Image/Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-white/10 mb-4">
                <div className="p-4 rounded-full bg-white/10">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-white font-orbitron text-2xl font-bold">{tier} Insurance</h3>
              <p className="text-white/70 mt-1">Protection from exploits & failures</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-auto">
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs">Max Payout</p>
                  <p className="text-white font-medium">{maxPayout}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">Expires</p>
                  <p className="text-white font-medium">{expiry}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsuranceNFT;
