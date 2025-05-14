
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InsurancePurchaseConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  selectedTier: string;
  existingPolicy: any;
}

const InsurancePurchaseConfirmation: React.FC<InsurancePurchaseConfirmationProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
  selectedTier,
  existingPolicy
}) => {
  const getActionType = () => {
    if (!existingPolicy) return "purchase";
    
    const tierValues = { "Basic": 1, "Pro": 2, "Premium": 3, "institutional": 3 };
    const displayTier = selectedTier === 'institutional' ? 'Premium' : selectedTier;
    const existingTierValue = tierValues[existingPolicy.tier as keyof typeof tierValues] || 0;
    const newTierValue = tierValues[displayTier as keyof typeof tierValues] || 0;
    
    if (newTierValue > existingTierValue) return "upgrade";
    if (newTierValue < existingTierValue) return "downgrade";
    return "renew";
  };
  
  const actionType = getActionType();
  const displayTier = selectedTier === 'institutional' ? 'Premium' : selectedTier;
  
  const getTitle = () => {
    switch (actionType) {
      case "upgrade": return "Upgrade Insurance";
      case "downgrade": return "Downgrade Insurance";
      case "renew": return "Renew Insurance";
      default: return "Purchase Insurance";
    }
  };
  
  const getDescription = () => {
    switch (actionType) {
      case "upgrade": 
        return `Are you sure you want to upgrade your insurance from ${existingPolicy?.tier} to ${displayTier}?`;
      case "downgrade": 
        return `Are you sure you want to downgrade your insurance from ${existingPolicy?.tier} to ${displayTier}?`;
      case "renew": 
        return `Are you sure you want to renew your ${displayTier} insurance?`;
      default: 
        return `Are you sure you want to purchase ${displayTier} insurance?`;
    }
  };
  
  const getButtonText = () => {
    if (loading) return "Processing...";
    switch (actionType) {
      case "upgrade": return `Upgrade to ${displayTier}`;
      case "downgrade": return `Downgrade to ${displayTier}`;
      case "renew": return "Renew Insurance";
      default: return "Purchase Insurance";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-iris-darker border border-iris-purple/20">
        <DialogHeader>
          <DialogTitle className="text-white">{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-center p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-iris-purple/10 text-iris-purple">
              {actionType === "upgrade" ? "⬆️" : actionType === "downgrade" ? "⬇️" : "🛡️"}
            </div>
          </div>
          
          {existingPolicy && (
            <div className="space-y-2 mb-4">
              <div>
                <span className="text-muted-foreground">Current tier: </span>
                <span className="text-white">{existingPolicy.tier}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current coverage: </span>
                <span className="text-white">${existingPolicy.max_coverage?.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">New tier: </span>
              <span className="text-white">{displayTier}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration: </span>
              <span className="text-white">30 days</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-iris-purple/30 hover:bg-iris-purple/5"
          >
            Cancel
          </Button>
          <Button
            className="neo-button"
            onClick={onConfirm}
            disabled={loading}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsurancePurchaseConfirmation;
