
import React from "react";
import { motion } from "framer-motion";

interface InsuranceTierCardProps {
  tier: any;
  selected: boolean;
  onSelect: () => void;
}

const tierStyles = {
  basic: {
    bg: "bg-gradient-to-br from-iris-blue/80 to-iris-purple/80",
    iconBg: "bg-iris-blue/30",
    border: "border-iris-blue/40",
  },
  pro: {
    bg: "bg-gradient-to-br from-iris-purple/80 to-[#A265F0]/80",
    iconBg: "bg-iris-purple/30",
    border: "border-iris-purple/40",
  },
  institutional: {
    bg: "bg-gradient-to-br from-[#9681EB]/80 to-[#6527BE]/80",
    iconBg: "bg-[#9681EB]/30",
    border: "border-[#6527BE]/60",
  },
};

// type TierId = keyof typeof tierStyles;

// interface InsuranceTierCardProps {
//   tier: Tier;
//   selected: boolean;
//   onSelect: (tier: Tier) => void;
// }

const InsuranceTierCard: React.FC<InsuranceTierCardProps> = ({ tier, selected, onSelect }) => {
  const style = tierStyles[tier.id as keyof typeof tierStyles];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={`relative w-full max-w-xs p-0 group transition-all rounded-2xl shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-iris-purple ${style.border} border-2 ${
        selected ? "ring-4 ring-iris-purple scale-105 z-10" : "hover:scale-105 hover:z-10"
      }`}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 250, damping: 17 }}
      aria-pressed={selected}
    >
      <div className={`absolute inset-0 ${style.bg} opacity-95`} />
      <div className="relative flex flex-col items-center px-8 py-8">
        <div className={`flex items-center justify-center mb-3 ${style.iconBg}`}>
          {tier.cardIcon}
          <span className="text-xl font-orbitron font-extrabold text-white ml-2">{tier.name}</span>
        </div>
        <div className="flex items-center mb-3">
          <span className="text-2xl font-orbitron font-extrabold text-white">
            {tier.maxCoverage}
          </span>
        </div>
        <div className="text-white/80 mb-4">{tier.duration}</div>
        <div className="w-full border-b border-white/10 mb-4"></div>
        <ul className="space-y-2 text-left">
          {tier.features.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-center text-sm text-white/90">
              <span className="w-1.5 h-1.5 rounded-full mr-2 bg-white/30"></span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col items-center">
          <div className="text-iris-purple-light font-orbitron text-lg font-bold mb-1">
            {tier.price}
          </div>
          <span className="text-xs text-white/70">per {tier.duration}</span>
        </div>
      </div>
      {selected && (
        <motion.div
          layoutId="selectedCard"
          className="absolute inset-0 rounded-2xl border-iris-purple pointer-events-none"
          style={{ borderWidth: 3, borderColor: "#A594F9" }}
          transition={{ type: "spring", damping: 21, stiffness: 310 }}
        />
      )}
    </motion.button>
  );
};

export default InsuranceTierCard;
