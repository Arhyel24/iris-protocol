
import React from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { Shield, ShieldCheck, ShieldPlus } from "lucide-react";
import InsuranceTierCard from "./InsuranceTierCard";

interface TierSelectionProps {
  selectedTier: string;
  setSelectedTier: (tier: string) => void;
  goToPayment: () => void;
}

interface InsuranceTier {
  id: string;
  name: string;
  maxCoverage: string;
  duration: string;
  price: string;
  features: string[];
  gradient: string;
  cardIcon: React.ReactNode;
  border: string;
}

const TierSelection: React.FC<TierSelectionProps> = ({ selectedTier, setSelectedTier, goToPayment }) => {
  const tiers: InsuranceTier[] = [
    {
      id: "basic",
      name: "Basic",
      maxCoverage: "$5,000",
      duration: "30 days",
      price: "0.5 SOL",
      features: [
        "Up to $5,000 in coverage",
        "Basic risk analysis",
        "Email notifications",
        "24-hour claims processing"
      ],
      gradient: "from-iris-blue/80 to-iris-purple/80",
      cardIcon: <ShieldPlus className="h-7 w-7 text-iris-blue" />,
      border: "border-iris-blue/40"
    },
    {
      id: "pro",
      name: "Pro",
      maxCoverage: "$25,000",
      duration: "30 days",
      price: "1.5 SOL",
      features: [
        "Up to $25,000 in coverage",
        "Advanced risk analysis",
        "Priority notifications",
        "12-hour claims processing",
        "Custom protection settings"
      ],
      gradient: "from-iris-purple/80 to-[#A265F0]/80",
      cardIcon: <ShieldCheck className="h-7 w-7 text-iris-purple" />,
      border: "border-iris-purple/40"
    },
    {
      id: "institutional",
      name: "Institutional",
      maxCoverage: "$100,000",
      duration: "30 days",
      price: "4.5 SOL",
      features: [
        "Up to $100,000 in coverage",
        "Enterprise-grade risk analysis",
        "Real-time notifications",
        "4-hour claims processing",
        "Custom protection settings",
        "Dedicated support agent"
      ],
      gradient: "from-[#9681EB]/80 to-[#6527BE]/80",
      cardIcon: <Shield className="h-7 w-7 text-[#9681EB]" />,
      border: "border-[#6527BE]/60"
    }
  ];

  return (
    <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-stretch">
        {tiers.map((tier) => (
          <InsuranceTierCard
            key={tier.id}
            tier={tier}
            selected={selectedTier === tier.id}
            onSelect={() => { 
              setSelectedTier(tier.id); 
              goToPayment();
            }}
          />
        ))}
      </div>
    </RadioGroup>
  );
};

export default TierSelection;
