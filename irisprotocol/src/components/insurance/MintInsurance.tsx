import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TierSelection from "./TierSelection";
import PaymentSection from "./PaymentSection";
import PaymentHistoryModal from "./PaymentHistoryModal";
import { createInsurancePolicy, getPaymentHistory, getInsuranceForWallet, upgradeInsurance, cancelInsurance, cancelExistingInsurance } from "@/services/insuranceService";
import { sendNotification } from "@/services/notificationService";
import { addDays, format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MintInsuranceProps {
  onInsurancePurchased?: () => void;
}

const MintInsurance: React.FC<MintInsuranceProps> = ({ onInsurancePurchased }) => {
  const [selectedTier, setSelectedTier] = useState("Pro");
  const [currentTab, setCurrentTab] = useState("tier");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [paymentDetail, setPaymentDetail] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [hasInsurance, setHasInsurance] = useState<{[key: string]: boolean}>({});
  const [existingPolicy, setExistingPolicy] = useState<any>(null);

  const { toast } = useToast();
  const { wallets, user } = useAuth();
  
  useEffect(() => {
    fetchPaymentHistory();
    
    if (wallets && wallets.length > 0) {
      setSelectedWallet(wallets[0].id);
      checkWalletInsurance(wallets[0].id);
    }
  }, [wallets]);
  
  const fetchPaymentHistory = async () => {
    const { data, error } = await getPaymentHistory();
    if (!error && data) {
      const formattedHistory = data.map(payment => ({
        date: format(new Date(payment.payment_date), 'MMM d, yyyy'),
        plan: payment.insurance_policies?.tier || 'Unknown',
        duration: `${payment.duration_days} days`,
        amount: `${payment.amount} SOL`,
        status: payment.status
      }));
      setPaymentHistory(formattedHistory);
    }
  };
  
  const checkWalletInsurance = async (walletId: string) => {
    const { data } = await getInsuranceForWallet(walletId);
    setHasInsurance(prev => ({
      ...prev,
      [walletId]: data ? data.status === "active" : false
    }));
    
    if (data && data.status === "active") {
      setExistingPolicy(data);
    } else {
      setExistingPolicy(null);
    }
  };

  const handleWalletChange = (walletId: string) => {
    setSelectedWallet(walletId);
    checkWalletInsurance(walletId);
  };

  const handleGoToPayment = () => {
    setCurrentTab("payment");
  };

  const handleOpenPaymentHistory = (history: any) => {
    setPaymentDetail(history);
    setPaymentModalOpen(true);
  };
  
  const handleMintInsurance = async () => {
    if (!selectedWallet) {
      toast({
        title: "No wallet selected",
        description: "Please select a wallet before minting insurance",
        variant: "destructive",
      });
      return;
    }
    
    // Check if wallet already has insurance
    if (hasInsurance[selectedWallet]) {
      setUpgradeModalOpen(true);
      return;
    }
    
    // Define tier details
    const tierDetails = {
      Basic: {
        max_coverage: 5000,
        monthly_premium: 0.5
      },
      Pro: {
        max_coverage: 25000,
        monthly_premium: 1.5
      },
      Premium: {
        max_coverage: 100000,
        monthly_premium: 4.5
      }
    };
    
    const tierName = selectedTier === 'institutional' ? 'Premium' : selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1);
    const tierConfig = tierDetails[tierName as keyof typeof tierDetails];
    
    setLoading(true);
    
    try {
      const expiresAt = addDays(new Date(), 30);
      
      // First cancel any existing insurance
      await cancelExistingInsurance(selectedWallet);
      
      const { data, error, actionType } = await createInsurancePolicy({
        wallet_id: selectedWallet,
        tier: tierName as "Basic" | "Pro" | "Premium",
        max_coverage: tierConfig.max_coverage,
        monthly_premium: tierConfig.monthly_premium,
        expires_at: expiresAt.toISOString()
      });
      
      if (error) {
        throw error;
      }
      
      let toastMessage = `Your ${tierName} insurance is now active.`;
      let toastTitle = "Insurance purchased successfully!";
      
      if (actionType === "upgrade") {
        toastTitle = "Insurance upgraded successfully!";
        toastMessage = `Your insurance has been upgraded to ${tierName}.`;
      } else if (actionType === "downgrade") {
        toastTitle = "Insurance downgraded successfully!";
        toastMessage = `Your insurance has been downgraded to ${tierName}.`;
      }
      
      toast({
        title: toastTitle,
        description: toastMessage,
      });
      
      // Send email notification for insurance purchase
      if (user?.email) {
        await sendNotification(user.email, {
          type: 'insurancePurchase',
          data: {
            tier: tierName,
            coverage: `$${tierConfig.max_coverage.toLocaleString()}`,
            expiry: format(expiresAt, "MMMM d, yyyy")
          }
        });
      }
      
      // Refresh payment history
      await fetchPaymentHistory();
      
      // Call the onInsurancePurchased callback if provided
      if (onInsurancePurchased) {
        onInsurancePurchased();
      } else {
        // Otherwise, reload the page
        window.location.reload();
      }
      
    } catch (err: any) {
      toast({
        title: "Failed to mint insurance",
        description: err.message || "An error occurred while minting insurance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpgradeInsurance = async () => {
    if (!existingPolicy) {
      toast({
        title: "No existing policy",
        description: "Could not find your existing policy to upgrade",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    const tierName = selectedTier === 'institutional' ? 'Premium' : selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1);
    
    try {
      const { data, error } = await upgradeInsurance(
        existingPolicy.id,
        tierName as "Basic" | "Pro" | "Premium"
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Insurance upgraded successfully!",
        description: `Your insurance has been upgraded to ${tierName}.`,
      });
      
      // Send email notification for insurance upgrade
      if (user?.email) {
        await sendNotification(user.email, {
          type: 'insuranceUpgrade',
          data: {
            oldTier: existingPolicy.tier,
            newTier: tierName,
            coverage: `$${data.max_coverage.toLocaleString()}`
          }
        });
      }
      
      // Refresh payment history
      await fetchPaymentHistory();
      
      // Call the onInsurancePurchased callback if provided
      if (onInsurancePurchased) {
        onInsurancePurchased();
      } else {
        // Otherwise, reload the page
        window.location.reload();
      }
      
    } catch (err: any) {
      toast({
        title: "Failed to upgrade insurance",
        description: err.message || "An error occurred while upgrading insurance",
        variant: "destructive",
      });
    } finally {
      setUpgradeModalOpen(false);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} 
      animate={{ opacity: 1, y: 0 }}
      className="mt-24 mb-24"
    >
      <Card className="glass-card border-none shadow-lg">
        <CardHeader className="py-8">
          <CardTitle className="text-xl font-semibold text-white">
            {existingPolicy ? "Upgrade Insurance" : "Mint New Insurance"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {existingPolicy 
              ? "Select a higher tier to upgrade your existing insurance" 
              : "Select a coverage tier that matches your portfolio value"}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-8">
          {/* Wallet Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white mb-2">
              Select Wallet
            </label>
            <Select
              value={selectedWallet || ''}
              onValueChange={handleWalletChange}
              disabled={loading}
            >
              <SelectTrigger className="bg-secondary border-iris-purple/20">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent className="bg-iris-darker border border-iris-purple/20">
                {wallets && wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name || wallet.address.substring(0, 8) + '...'} 
                    {hasInsurance[wallet.id] && " (Has Insurance)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-10 bg-secondary">
              <TabsTrigger value="tier">Select Tier</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="tier">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="py-6"
              >
                <TierSelection 
                  selectedTier={selectedTier} 
                  setSelectedTier={setSelectedTier}
                  goToPayment={handleGoToPayment}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="payment">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="py-6"
              >
                <PaymentSection 
                  selectedTier={selectedTier}
                  paymentHistory={paymentHistory}
                  onHistoryClick={handleOpenPaymentHistory}
                />
                <PaymentHistoryModal
                  open={paymentModalOpen}
                  onOpenChange={setPaymentModalOpen}
                  history={paymentDetail || {}}
                />
                
                {/* Payment History */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Recent Payments</h3>
                  {paymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {paymentHistory.slice(0, 3).map((payment, index) => (
                        <div 
                          key={index} 
                          className="p-4 border border-iris-purple/10 rounded-lg bg-secondary/30"
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="text-white font-medium">{payment.plan} Plan</p>
                              <p className="text-xs text-muted-foreground">{payment.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-iris-purple">{payment.amount}</p>
                              <p className="text-xs text-green-500">{payment.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No payment history</p>
                  )}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 py-8 px-8">
          {currentTab === "payment" && (
            <Button variant="outline" className="border-iris-purple/30 hover:bg-iris-purple/5 w-full sm:w-auto" onClick={() => setCurrentTab("tier")}>
              Cancel
            </Button>
          )}
          <Button 
            className="neo-button w-full sm:w-auto"
            onClick={handleMintInsurance}
            disabled={loading || !selectedWallet}
          >
            {loading ? "Processing..." : existingPolicy ? "Upgrade Insurance" : "Mint Insurance NFT"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Upgrade Insurance Dialog */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="bg-iris-darker border border-iris-purple/20">
          <DialogHeader>
            <DialogTitle className="text-white">Upgrade Insurance</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              This wallet already has {existingPolicy?.tier} insurance. Would you like to upgrade to {selectedTier === 'institutional' ? 'Premium' : selectedTier}?
            </p>
            
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Current Tier: </span>
                <span className="text-white font-medium">{existingPolicy?.tier}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current Coverage: </span>
                <span className="text-white font-medium">${existingPolicy?.max_coverage?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">New Tier: </span>
                <span className="text-white font-medium">{selectedTier === 'institutional' ? 'Premium' : selectedTier}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpgradeModalOpen(false)}
              disabled={loading}
              className="border-iris-purple/30 hover:bg-iris-purple/5"
            >
              Cancel
            </Button>
            <Button
              className="neo-button"
              onClick={handleUpgradeInsurance}
              disabled={loading}
            >
              {loading ? "Processing..." : "Upgrade Insurance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MintInsurance;
