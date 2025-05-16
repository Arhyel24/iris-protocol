
import React from "react";
import { Badge, Shield, ArrowLeftRight, GitBranch } from "lucide-react";

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="glass-card glass-card-glow p-6 md:p-8 h-full bg-opacity-80">
      <div className="bg-gradient-to-br from-iris-purple-light/20 to-iris-blue-light/20 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="font-orbitron text-xl font-semibold mb-3 text-white">
        {title}
      </h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <div className="py-20 bg-iris-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-iris-purple to-iris-blue">
              Intelligent Protection
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            IRIS combines advanced AI monitoring with automated DeFi strategies to provide comprehensive protection for your digital assets.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Badge className="h-6 w-6 text-iris-purple" />}
            title="Risk Score AI"
            description="Real-time AI analysis of your portfolio, continuously calculating risk scores for each asset and your overall position."
          />
          
          <FeatureCard 
            icon={<ArrowLeftRight className="h-6 w-6 text-iris-blue" />}
            title="Auto Swaps"
            description="Automatically convert high-risk assets to stablecoins when dangerous market conditions are detected."
          />
          
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-iris-green" />}
            title="NFT Insurance"
            description="Mint insurance NFTs that guarantee coverage for losses and serve as your protection certificate."
          />
          
          <FeatureCard 
            icon={<GitBranch className="h-6 w-6 text-iris-purple-light" />}
            title="DAO Governance"
            description="Community-owned protocol where token holders vote on platform parameters and insurance payouts."
          />
        </div>
      </div>
    </div>
  );
};

export default Features;
