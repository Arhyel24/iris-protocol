
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  score, 
  size = "md", 
  showText = true,
  className
}) => {
  const getRiskLevel = () => {
    if (score <= 30) return "Low";
    if (score <= 70) return "Medium";
    return "High";
  };
  
  const getBadgeColors = () => {
    if (score <= 30) return "bg-gradient-to-r from-iris-green/20 to-iris-green/10 text-iris-green border-iris-green/30";
    if (score <= 70) return "bg-gradient-to-r from-iris-yellow/20 to-iris-yellow/10 text-iris-yellow border-iris-yellow/30";
    return "bg-gradient-to-r from-iris-red/20 to-iris-red/10 text-iris-red border-iris-red/30";
  };
  
  const getBadgeGlow = () => {
    if (score <= 30) return "shadow-[0_0_10px_rgba(6,214,160,0.3)]";
    if (score <= 70) return "shadow-[0_0_10px_rgba(255,209,102,0.3)]";
    return "shadow-[0_0_10px_rgba(255,107,107,0.3)]";
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "px-2 py-0.5 text-xs";
      case "lg": return "px-3 py-1.5 text-base";
      default: return "px-2.5 py-1 text-sm";
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium rounded-md border", 
        getBadgeColors(),
        getBadgeGlow(),
        getSizeClasses(),
        className
      )}
    >
      {showText ? (
        <>
          {getRiskLevel()} Risk: {score}
        </>
      ) : (
        score
      )}
    </Badge>
  );
};

export default RiskBadge;
