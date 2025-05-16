"use client"


import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClaimPage from "@/components/claim/ClaimPage";
import CustomTokenDialog from "@/components/claim/CustomTokenDialog";
import ClaimDetailsDialog from "@/components/claim/ClaimDetailsDialog";
import ClaimFormModal from "@/components/claim/ClaimFormModal";

const Claim: React.FC = () => {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [showClaimDetail, setShowClaimDetail] = useState(false);
  const [detailClaim, setDetailClaim] = useState<any>(null);
  const [affectedTokens, setAffectedTokens] = useState(["SOL", "JTO", "BONK", "PYTH"]);
  const [claimFormOpen, setClaimFormOpen] = useState(false);

  const handleAddCustomToken = (token: { symbol: string; address: string }) => {
    if (token.symbol.trim()) {
      setAffectedTokens((prev) => [...prev, token.symbol.trim()]);
    }
  };

  const handleOpenCustomModal = () => {
    setCustomModalOpen(true);
  };
  
  const handleOpenClaimForm = () => {
    setClaimFormOpen(true);
  };
  
  const handleSubmitClaim = (claimData: any) => {
    // Claim submitted
  };

  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <ClaimPage 
          onOpenCustomModal={handleOpenCustomModal} 
          onOpenClaimForm={handleOpenClaimForm}
        />
        
        <CustomTokenDialog 
          open={customModalOpen}
          onOpenChange={setCustomModalOpen}
          onAddToken={handleAddCustomToken}
        />
        
        <ClaimDetailsDialog
          open={showClaimDetail}
          onOpenChange={setShowClaimDetail}
          claim={detailClaim}
        />
        
        <ClaimFormModal
          open={claimFormOpen}
          onOpenChange={setClaimFormOpen}
          affectedTokens={affectedTokens}
          onSubmit={handleSubmitClaim}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Claim;
