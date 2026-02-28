import React from "react";
import { Plane, Smartphone, HeartPulse, ShieldAlert } from "lucide-react";

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  number: string;
}> = ({ icon, title, description, number }) => {
  return (
    <div className="group relative bg-black border border-white/10 p-8 hover:border-primary transition-colors duration-300">
      <div className="absolute top-0 right-0 p-4 text-4xl font-black text-white/5 font-mono group-hover:text-primary/10 transition-colors duration-300">
        {number}
      </div>
      <div className="w-12 h-12 border border-primary/30 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
        {icon}
      </div>
      <h3 className="font-mono text-xl font-bold mb-3 text-white uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-muted-foreground font-mono text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <div className="py-24 bg-black border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="mb-16 border-l-4 border-primary pl-6">
          <h2 className="font-mono text-3xl md:text-5xl font-black mb-4 text-white uppercase tracking-tighter">
            Global Coverage.<br />
            On-Chain Execution.
          </h2>
          <p className="text-muted-foreground font-mono text-lg max-w-2xl">
            We bridge the gap between traditional insurance APIs and decentralized finance, providing instant, programmatic payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            number="01"
            icon={<Plane className="h-6 w-6" strokeWidth={1.5} />}
            title="Flight Delay"
            description="Automatically triggered payouts when commercial flights are delayed or canceled, utilizing global oracle feeds."
          />
          <FeatureCard
            number="02"
            icon={<Smartphone className="h-6 w-6" strokeWidth={1.5} />}
            title="Gadget Cover"
            description="Protect your high-value electronics. File a claim with the Web2 API and receive USDC directly to your wallet."
          />
          <FeatureCard
            number="03"
            icon={<HeartPulse className="h-6 w-6" strokeWidth={1.5} />}
            title="Travel Health"
            description="Global medical coverage that pays out in stablecoins, bypassing traditional banking delays and international wire fees."
          />
          <FeatureCard
            number="04"
            icon={<ShieldAlert className="h-6 w-6" strokeWidth={1.5} />}
            title="Developer API"
            description="Embed our crypto-fiat insurance bridge directly into your own dApps with our headless SDK."
          />
        </div>
      </div>
    </div>
  );
};

export default Features;
