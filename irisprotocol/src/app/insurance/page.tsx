"use client"

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InsuranceNFT, { TierType } from "@/components/insurance/InsuranceNFT";
import MintInsurance from "@/components/insurance/MintInsurance";
import PaymentHistory from "@/components/insurance/PaymentHistory";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveInsurancePolicy, InsurancePolicy, cancelInsurance } from "@/services/insuranceService";
import { format, parseISO, isAfter } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { sendNotification } from "@/services/notificationService";

const Insurance: React.FC = () => {
  const [activeInsurance, setActiveInsurance] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchInsurance();
  }, []);
  
  const fetchInsurance = async () => {
    setLoading(true);
    try {
      const { data, error } = await getActiveInsurancePolicy();
      if (!error && data) {
        // Type assertion to handle the response
        setActiveInsurance(data as unknown as InsurancePolicy);
      } else {
        setActiveInsurance(null);
      }
    } catch (err) {
      console.error("Failed to fetch insurance:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Format data for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };
  
  const isActive = (expiryDate: string) => {
    return isAfter(parseISO(expiryDate), new Date());
  };

  const handleCancelInsurance = async () => {
    if (!activeInsurance) return;
    
    setCancelLoading(true);
    
    try {
      const { error } = await cancelInsurance(activeInsurance.id);
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Insurance Canceled",
        description: "Your insurance policy has been successfully canceled.",
      });
      
      // Send email notification
      if (user?.email) {
        await sendNotification(user.email, {
          type: 'insuranceCancel',
          data: {
            tier: activeInsurance.tier
          }
        });
      }
      
      // Update state instead of reloading
      setActiveInsurance(null);
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel insurance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelDialogOpen(false);
      setCancelLoading(false);
    }
  };
  
  const handleInsurancePurchased = () => {
    // Refresh insurance data
    fetchInsurance();
    // Trigger animation
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 3000);
  };

  // Convert tier string to TierType for InsuranceNFT
  const getTierType = (tier: string): TierType => {
    if (tier === "Basic" || tier === "Pro" || tier === "Premium") {
      return tier as TierType;
    }
    return "Basic"; // Default fallback
  };
  
  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <motion.h1 
            className="text-2xl font-orbitron font-bold text-white mt-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Insurance NFT
          </motion.h1>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="h-12 w-12 bg-slate-600 rounded-full"></div>
                <div className="space-y-4 flex-1">
                  <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-600 rounded"></div>
                  <div className="h-4 bg-slate-600 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : activeInsurance ? (
            <AnimatePresence>
              {showAnimation ? (
                <motion.div
                  key="insurance-animation"
                  className="fixed inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                >
                  <div className="backdrop-blur-md bg-black/40 absolute inset-0" />
                  <motion.div 
                    className="relative z-10 scale-125"
                    animate={{ 
                      rotateY: [0, 360],
                      boxShadow: ["0px 0px 0px rgba(125, 75, 255, 0)", "0px 0px 30px rgba(125, 75, 255, 0.8)", "0px 0px 0px rgba(125, 75, 255, 0)"]
                    }}
                    transition={{ duration: 2, times: [0, 0.5, 1] }}
                  >
                    <InsuranceNFT 
                      tier={getTierType(activeInsurance.tier)}
                      maxPayout={formatCurrency(activeInsurance.max_coverage)}
                      expiry={formatDate(activeInsurance.expires_at)}
                      isActive={isActive(activeInsurance.expires_at) && activeInsurance.status === 'active'}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <div>
                  <InsuranceNFT 
                    tier={getTierType(activeInsurance.tier)}
                    maxPayout={formatCurrency(activeInsurance.max_coverage)}
                    expiry={formatDate(activeInsurance.expires_at)}
                    isActive={isActive(activeInsurance.expires_at) && activeInsurance.status === 'active'}
                  />
                  
                  <div className="mt-8 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setCancelDialogOpen(true)}
                      className="border-iris-red/30 hover:bg-iris-red/10 text-iris-red"
                    >
                      Cancel Insurance
                    </Button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          ) : (
            <Alert className="bg-iris-darker border border-iris-purple/20">
              <AlertCircle className="h-4 w-4 text-iris-purple" />
              <AlertTitle className="text-white">No Active Insurance</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                You don't have an active insurance policy. Mint one to protect your crypto assets.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Payment history moved out of MintInsurance and directly into Insurance page */}
          {activeInsurance && (
            <PaymentHistory insuranceId={activeInsurance.id} />
          )}
          
          <div className="mt-16">
            <MintInsurance onInsurancePurchased={handleInsurancePurchased} />
          </div>
          
          {/* Payment history for all insurance policies */}
          {!activeInsurance && (
            <PaymentHistory />
          )}
          
          {/* Cancel Insurance Dialog */}
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="bg-iris-darker border border-iris-purple/20">
              <DialogHeader>
                <DialogTitle className="text-white">Cancel Insurance</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your insurance policy? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={cancelLoading}
                >
                  Keep Insurance
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelInsurance}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? "Processing..." : "Yes, Cancel Insurance"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Insurance;
