
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cancelClaim } from "@/services/claimService";
import { useToast } from "@/hooks/use-toast";

export interface ClaimStatusProps {
  claim?: any;
  activeClaim?: any;
  loading?: boolean;
  onStatusUpdate?: () => void;
}

const ClaimStatus: React.FC<ClaimStatusProps> = ({ claim, activeClaim, loading, onStatusUpdate }) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Use the activeClaim prop if provided, otherwise fall back to claim
  const claimData = activeClaim || claim;

  // If no claim data and loading is false, show no active claim message
  if (!claimData && !loading) {
    return (
      <Card className="glass-card border-none shadow-lg mb-6">
        <CardContent className="py-10 text-center">
          <div className="text-muted-foreground">
            <CircleDollarSign className="h-10 w-10 mx-auto mb-4 opacity-60" />
            <h3 className="text-lg font-medium text-white mb-2">No Active Claims</h3>
            <p>You don't have any active insurance claim at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading skeleton if loading is true
  if (loading) {
    return (
      <Card className="glass-card border-none shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-7 bg-iris-darker/60 w-1/3 rounded"></div>
            <div className="h-4 bg-iris-darker/40 w-full rounded"></div>
            <div className="h-4 bg-iris-darker/40 w-1/2 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-500 border-gray-500/30"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-500 border-gray-500/30">{status}</Badge>;
    }
  };
  
  const handleCancelClaim = async () => {
    if (!claimData || !claimData.id) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await cancelClaim(claimData.id);
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Claim Cancelled",
        description: "Your claim has been cancelled successfully."
      });
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelDialogOpen(false);
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Card className="glass-card border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Active Claim</CardTitle>
          {getStatusBadge(claimData.status)}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Claim ID</span>
              <span className="text-white font-mono">{claimData.claim_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-white font-bold">{formatCurrency(claimData.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reason</span>
              <span className="text-white">{claimData.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet</span>
              <span className="text-white">{claimData.wallets?.name || claimData.wallets?.address?.substring(0, 8) + '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Affected Assets</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {claimData.affected_assets?.map((asset: string) => (
                  <Badge key={asset} variant="secondary" className="bg-iris-purple/10">{asset}</Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insurance Tier</span>
              <span className="text-white">{claimData.insurance_policies?.tier || "Not covered"}</span>
            </div>
          </div>
        </CardContent>
        {claimData.status === "pending" && (
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-iris-red/30 hover:bg-iris-red/10 text-iris-red"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Claim
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Cancel Claim Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-iris-darker border border-iris-purple/20">
          <DialogHeader>
            <DialogTitle className="text-white">Cancel Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your claim? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-iris-red/10 text-iris-red">
                <CircleDollarSign className="w-8 h-8" />
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              Your claim for <span className="text-white font-medium">{formatCurrency(claimData.amount)}</span> will be cancelled.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isLoading}
              className="border-iris-purple/30 hover:bg-iris-purple/5"
            >
              Keep Claim
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelClaim}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Yes, Cancel Claim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClaimStatus;
