
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Clock, Ban, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cancelClaim } from "@/services/claimService";
import { useToast } from "@/hooks/use-toast";

interface ClaimDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: any;
}

const ClaimDetailsDialog: React.FC<ClaimDetailsDialogProps> = ({ open, onOpenChange, claim }) => {
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { toast } = useToast();

  if (!claim) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const getBadgeDetails = (status: string) => {
    switch(status) {
      case "pending":
        return {
          text: "Pending",
          class: "bg-amber-500/20 border border-amber-500/30 text-amber-500",
          icon: <Clock className="h-3 w-3 mr-1" />
        };
      case "approved":
        return {
          text: "Approved",
          class: "bg-iris-green/20 border border-iris-green/30 text-iris-green",
          icon: <Check className="h-3 w-3 mr-1" />
        };
      case "rejected":
        return {
          text: "Rejected",
          class: "bg-iris-red/20 border border-iris-red/30 text-iris-red",
          icon: <AlertCircle className="h-3 w-3 mr-1" />
        };
      case "cancelled":
        return {
          text: "Cancelled",
          class: "bg-gray-500/20 border border-gray-500/30 text-gray-500",
          icon: <Ban className="h-3 w-3 mr-1" />
        };
      default:
        return {
          text: status || "Unknown",
          class: "bg-gray-500/20 border border-gray-500/30 text-gray-500",
          icon: <Clock className="h-3 w-3 mr-1" />
        };
    }
  };

  const badge = getBadgeDetails(claim.status);
  
  const handleCancelClaim = async () => {
    if (!claim.id) return;
    
    setCancelling(true);
    
    try {
      const { error } = await cancelClaim(claim.id);
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Claim Cancelled",
        description: "Your claim has been successfully cancelled.",
      });
      
      // Update the claim status locally
      claim.status = "cancelled";
      
      // Reset cancel confirmation
      setConfirmCancel(false);
      
      // Close dialog after a short delay to show updated status
      setTimeout(() => onOpenChange(false), 1500);
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-iris-darker border-none shadow-lg max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-white">
              Claim #{claim.claim_number || claim.id}
            </DialogTitle>
            <Badge className={`${badge.class} flex items-center`}>
              {badge.icon} {badge.text}
            </Badge>
          </div>
          <DialogDescription className="text-muted-foreground">
            Submitted on {formatDate(claim.created_at || claim.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {claim.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Processing</span>
                <span className="text-white">{claim.progress}%</span>
              </div>
              <Progress value={claim.progress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Amount</p>
              <p className="text-white font-semibold">{claim.amount}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Affected Assets</p>
              <p className="text-white font-semibold">
                {claim.affected_assets ? claim.affected_assets.join(", ") : claim.assets?.join(", ") || "N/A"}
              </p>
            </div>
          </div>

          <Separator className="border-iris-purple/10" />

          <div>
            <p className="text-muted-foreground text-sm">Reason</p>
            <p className="text-white">{claim.reason}</p>
          </div>

          {claim.description && (
            <div>
              <p className="text-muted-foreground text-sm">Description</p>
              <p className="text-white text-sm">{claim.description}</p>
            </div>
          )}

          {claim.evidence_url && (
            <div>
              <p className="text-muted-foreground text-sm">Evidence</p>
              <div className="flex items-center text-iris-purple">
                <FileText className="h-4 w-4 mr-1" />
                <a href={claim.evidence_url} target="_blank" rel="noopener noreferrer" className="text-sm">
                  View Evidence
                </a>
              </div>
            </div>
          )}

          {claim.status === "pending" && (
            <Alert className="bg-amber-500/10 border border-amber-500/30">
              <Clock className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-white text-sm">Processing</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                Your claim is being reviewed. We'll notify you once there's an update.
              </AlertDescription>
            </Alert>
          )}

          {claim.status === "rejected" && claim.rejection_reason && (
            <Alert className="bg-iris-red/10 border border-iris-red/30">
              <AlertCircle className="h-4 w-4 text-iris-red" />
              <AlertTitle className="text-white text-sm">Claim Rejected</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                {claim.rejection_reason}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {claim.status === "pending" && (
          <DialogFooter>
            {!confirmCancel ? (
              <Button 
                variant="outline" 
                className="border-iris-red/30 hover:bg-iris-red/10 text-iris-red"
                onClick={() => setConfirmCancel(true)}
              >
                Cancel Claim
              </Button>
            ) : (
              <>
                <div className="text-xs text-muted-foreground mb-2 w-full text-center">
                  Are you sure you want to cancel this claim?
                </div>
                <div className="flex space-x-2 w-full">
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setConfirmCancel(false)}
                    disabled={cancelling}
                  >
                    No, Keep Claim
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleCancelClaim}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailsDialog;
