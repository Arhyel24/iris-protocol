
import React, { useState, useEffect } from "react";
import ClaimStatus from "@/components/claim/ClaimStatus";
import ClaimHistory from "@/components/claim/ClaimHistory";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getUserClaims, getActiveClaim, hasActiveInsurance } from "@/services/claimService";
import { getActiveInsurancePolicy } from "@/services/insuranceService";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export interface ClaimPageProps {
  onOpenCustomModal: () => void;
  onOpenClaimForm: () => void;
  onViewClaimDetail?: (claim: any) => void;
}

const ClaimPage: React.FC<ClaimPageProps> = ({ 
  onOpenCustomModal, 
  onOpenClaimForm,
  onViewClaimDetail 
}) => {
  const [loading, setLoading] = useState(true);
  const [hasInsurance, setHasInsurance] = useState(false);
  
  // State for API data
  const [claimHistory, setClaimHistory] = useState<any[]>([]);
  const [activeClaim, setActiveClaim] = useState<any>(null);
  
  const { wallets } = useAuth();

  // Fetch claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    
    try {
      // Check if user has insurance
      const { data: insuranceData } = await getActiveInsurancePolicy();
      setHasInsurance(!!insuranceData);
      
      // Fetch active claim
      const activeClaimResult = await getActiveClaim();
      if (activeClaimResult.data) {
        setActiveClaim(formatClaimForDisplay(activeClaimResult.data as any));
      }
      
      // Fetch all claims
      const claimsResult = await getUserClaims();
      if (claimsResult.data) {
        const formattedClaims = claimsResult.data.map((claim: any) => formatClaimForDisplay(claim));
        setClaimHistory(formattedClaims);
      }
    } catch (err) {
      console.error("Error fetching claims:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to format a claim for display
  const formatClaimForDisplay = (claim: any) => {
    return {
      id: claim.id,
      claim_number: claim.claim_number,
      date: format(parseISO(claim.created_at), 'MMMM d, yyyy'),
      status: claim.status,
      amount: claim.amount,
      reason: claim.reason,
      description: claim.description,
      affected_assets: claim.affected_assets,
      evidence_url: claim.evidence_url,
      wallets: claim.wallets,
      insurance_policies: claim.insurance_policies,
      progress: calculateProgress(claim)
    };
  };
  
  // Calculate progress percentage for pending claims
  const calculateProgress = (claim: any) => {
    if (claim.status === 'approved') return 100;
    if (claim.status === 'rejected') return 100;
    if (claim.status === 'cancelled') return 100;
    
    // For pending claims, calculate based on time elapsed
    const createdAt = new Date(claim.created_at).getTime();
    const now = new Date().getTime();
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    
    // Assuming review takes ~5 days
    return Math.min(Math.round((daysSinceCreation / 5) * 100), 95);
  };

  const handleClaimStatusUpdate = () => {
    fetchClaims();
  };

  const handleViewClaimDetail = (claim: any) => {
    if (onViewClaimDetail) {
      onViewClaimDetail(claim);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-orbitron font-bold text-white mt-4">
            Claims
          </h1>
          
          <Button 
            className="neo-button"
            onClick={() => {
              if (!hasInsurance) {
                window.location.href = '/insurance';
              } else {
                onOpenClaimForm();
              }
            }}
          >
            {hasInsurance ? "New Claim" : "Get Insurance"}
          </Button>
        </div>
        
        {!hasInsurance && !loading && claimHistory.length === 0 ? (
          <Alert className="bg-iris-darker border border-iris-purple/20">
            <AlertCircle className="h-4 w-4 text-iris-purple" />
            <AlertTitle className="text-white">No Active Insurance</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              You need to have an active insurance policy to submit a claim. Please purchase insurance first.
            </AlertDescription>
            <div className="mt-4">
              <Button 
                className="neo-button"
                onClick={() => window.location.href = '/insurance'}
              >
                Get Insurance
              </Button>
            </div>
          </Alert>
        ) : (
          <>
            <ClaimStatus 
              activeClaim={activeClaim}
              loading={loading}
              onStatusUpdate={handleClaimStatusUpdate}
            />

            <ClaimHistory
              claims={claimHistory}
              loading={loading}
              onRowClick={handleViewClaimDetail}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ClaimPage;
