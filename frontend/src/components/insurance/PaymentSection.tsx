
import React from "react";
import { Label } from "@/components/ui/label";

interface PaymentSectionProps {
  selectedTier: string;
  paymentHistory: Array<{
    date: string;
    plan: string;
    duration: string;
    amount: string;
    status: string;
  }>;
  onHistoryClick: (historyItem: any) => void;
}

interface TierInfo {
  id: string;
  name: string;
  maxCoverage: string;
  duration: string;
  price: string;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ 
  selectedTier, 
  paymentHistory,
  onHistoryClick
}) => {
  // This data would ideally come from a context or props
  const tiers: TierInfo[] = [
    {
      id: "basic",
      name: "Basic",
      maxCoverage: "$5,000",
      duration: "30 days",
      price: "0.5 SOL"
    },
    {
      id: "pro",
      name: "Pro",
      maxCoverage: "$25,000",
      duration: "30 days",
      price: "1.5 SOL"
    },
    {
      id: "institutional",
      name: "Institutional",
      maxCoverage: "$100,000",
      duration: "30 days",
      price: "4.5 SOL"
    }
  ];

  const selectedTierInfo = tiers.find(t => t.id === selectedTier);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 p-6 border border-iris-purple/10 rounded-xl bg-secondary/50">
        <h3 className="font-orbitron text-lg font-medium mb-4 text-white">Payment Summary</h3>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Selected Plan</span>
            <span className="font-medium text-white">
              {selectedTierInfo?.name} - {selectedTierInfo?.duration}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Coverage Amount</span>
            <span className="font-medium text-white">{selectedTierInfo?.maxCoverage}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-iris-purple/10">
            <span className="font-medium">Total Price</span>
            <span className="font-medium text-white">{selectedTierInfo?.price}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id="pay-sol" 
              name="payment-method" 
              className="h-4 w-4 border-iris-purple/30 text-iris-purple focus:ring-iris-purple/20"
              defaultChecked
            />
            <Label htmlFor="pay-sol" className="text-white">Pay with SOL</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id="pay-usdc" 
              name="payment-method" 
              className="h-4 w-4 border-iris-purple/30 text-iris-purple focus:ring-iris-purple/20"
            />
            <Label htmlFor="pay-usdc" className="text-white">Pay with USDC</Label>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 border border-iris-purple/10 rounded-xl bg-secondary/50">
        <h3 className="font-orbitron text-lg font-medium mb-4 text-white">Payment History</h3>
        <div className="space-y-4">
          {paymentHistory.map((hist, idx) => (
            <button
              key={idx}
              type="button"
              className="flex justify-between items-center p-3 rounded-lg bg-iris-purple/10 border border-iris-purple/20 w-full hover:bg-iris-purple/20"
              onClick={() => onHistoryClick(hist)}
            >
              <div>
                <span className="block text-white font-bold">{hist.plan}</span>
                <span className="block text-xs text-muted-foreground">{hist.duration}</span>
                <span className="block text-xs">{hist.date}</span>
              </div>
              <div className="text-right">
                <span className="font-orbitron text-lg text-iris-purple">{hist.amount}</span>
                <span className="block text-xs text-iris-green">{hist.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
