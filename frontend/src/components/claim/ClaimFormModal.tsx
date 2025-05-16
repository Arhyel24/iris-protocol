
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowRight, ArrowLeft, Check, DollarSign, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createClaim } from "@/services/claimService";
import { sendNotification } from "@/services/notificationService";
import { getActiveInsurancePolicy } from "@/services/insuranceService";
import { uploadClaimEvidence } from "@/services/storageService";
import { Progress } from "@/components/ui/progress";

interface ClaimFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affectedTokens: string[];
  onSubmit: (claimData: any) => void;
}

const ClaimFormModal: React.FC<ClaimFormModalProps> = ({ open, onOpenChange, affectedTokens, onSubmit }) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(33);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    transactionHash: "",
    reason: "",
    lossAmount: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [activeInsurance, setActiveInsurance] = useState<any>(null);
  const [hasCheckedInsurance, setHasCheckedInsurance] = useState(false);
  
  const { toast } = useToast();
  const { wallets, user } = useAuth();

  useEffect(() => {
    if (open && !hasCheckedInsurance) {
      fetchActiveInsurance();
      setHasCheckedInsurance(true);
    }
    
    if (!open) {
      // Reset form when modal is closed
      resetForm();
    }
  }, [open]);
  
  const fetchActiveInsurance = async () => {
    const { data } = await getActiveInsurancePolicy();
    if (data) {
      setActiveInsurance(data);
      setSelectedWallet(data.wallet_id);
    } else {
      toast({
        title: "No active insurance",
        description: "You need an active insurance policy to submit a claim",
        variant: "destructive"
      });
      onOpenChange(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTokenSelect = (token: string) => {
    if (selectedTokens.includes(token)) {
      setSelectedTokens(selectedTokens.filter(t => t !== token));
    } else {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      reason: value
    });
  };
  
  const handleWalletSelect = (value: string) => {
    setSelectedWallet(value);
  };
  
  const resetForm = () => {
    setSelectedTokens([]);
    setFormData({
      transactionHash: "",
      reason: "",
      lossAmount: "",
      description: ""
    });
    setImagePreview(null);
    setEvidenceFile(null);
    setHasCheckedInsurance(false);
    setCurrentStep(1);
    setProgress(33);
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      if (!selectedWallet) {
        toast({
          title: "No wallet selected",
          description: "Please select a wallet for the claim",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 2) {
      if (selectedTokens.length === 0 || !formData.reason) {
        toast({
          title: "Missing information",
          description: "Please select at least one affected token and reason",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
    setProgress((currentStep + 1) * 33);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setProgress((currentStep - 1) * 33);
  };

  const handleSubmit = async () => {
    if (!selectedWallet) {
      toast({
        title: "No wallet selected",
        description: "Please select a wallet for the claim",
        variant: "destructive"
      });
      return;
    }
    
    if (!activeInsurance) {
      toast({
        title: "No active insurance",
        description: "You need an active insurance policy to submit a claim",
        variant: "destructive"
      });
      onOpenChange(false);
      return;
    }
    
    if (selectedTokens.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one affected token",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.reason || !formData.lossAmount) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const amount = parseFloat(formData.lossAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid loss amount");
      }
      
      const reasonMap: { [key: string]: string } = {
        "market-crash": "Market Crash",
        "protocol-exploit": "Protocol Exploit",
        "flash-loan": "Flash Loan Attack",
        "depeg": "Stablecoin Depeg",
        "oracle-failure": "Oracle Failure",
        "other": "Other"
      };
      
      // Upload evidence file if provided
      let evidenceUrl = null;
      if (evidenceFile && user?.id) {
        evidenceUrl = await uploadClaimEvidence(evidenceFile, user.id);
      }
      
      const { data, error } = await createClaim({
        wallet_id: selectedWallet,
        insurance_id: activeInsurance.id,
        amount: amount,
        reason: reasonMap[formData.reason] || formData.reason,
        description: formData.description,
        transaction_hash: formData.transactionHash || undefined,
        affected_assets: selectedTokens,
        evidence_url: evidenceUrl
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Claim submitted successfully",
        description: `Your claim #${data.claim_number} is being processed`
      });
      
      // Send email notification
      if (user?.email) {
        await sendNotification(user.email, {
          type: 'claimSubmitted',
          data: {
            claimId: data.claim_number,
            amount: `$${amount.toLocaleString()}`
          }
        });
      }
      
      onSubmit({
        id: data.claim_number,
        date: new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}),
        status: "pending",
        amount: `$${amount.toLocaleString()}`,
        reason: formData.description || reasonMap[formData.reason],
        assets: selectedTokens,
        progress: 10
      });
      
      // Reset form and close modal
      resetForm();
      onOpenChange(false);
      
    } catch (err: any) {
      toast({
        title: "Failed to submit claim",
        description: err.message || "An error occurred while submitting the claim",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Select Wallet and Transaction
  const renderStep1 = () => (
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <Label htmlFor="wallet-select" className="text-white">Select Wallet</Label>
        <Select onValueChange={handleWalletSelect} value={selectedWallet || undefined}>
          <SelectTrigger id="wallet-select" className="bg-secondary border-iris-purple/20">
            <SelectValue placeholder="Select wallet" />
          </SelectTrigger>
          <SelectContent className="bg-iris-darker border border-iris-purple/20">
            {wallets?.map(wallet => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.name || wallet.address.substring(0, 8) + '...'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="transaction-hash" className="text-white">Transaction Hash (Optional)</Label>
        <Input 
          id="transactionHash" 
          placeholder="Enter the transaction hash related to the loss" 
          className="bg-secondary border-iris-purple/20"
          value={formData.transactionHash}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground">The Solana transaction where the loss occurred</p>
      </div>
    </div>
  );

  // Step 2: Select Reason and Tokens
  const renderStep2 = () => (
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <Label htmlFor="incident-reason" className="text-white">Incident Reason</Label>
        <Select onValueChange={handleSelectChange} value={formData.reason}>
          <SelectTrigger id="incident-reason" className="bg-secondary border-iris-purple/20">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent className="bg-iris-darker border border-iris-purple/20">
            <SelectItem value="market-crash">Market Crash</SelectItem>
            <SelectItem value="protocol-exploit">Protocol Exploit</SelectItem>
            <SelectItem value="flash-loan">Flash Loan Attack</SelectItem>
            <SelectItem value="depeg">Stablecoin Depeg</SelectItem>
            <SelectItem value="oracle-failure">Oracle Failure</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label className="text-white">Affected Assets</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {affectedTokens.map(token => (
            <Button 
              key={token}
              variant="outline" 
              size="sm" 
              className={`${selectedTokens.includes(token) 
                ? "bg-iris-purple/20 border-iris-purple text-white" 
                : "bg-iris-purple/5 hover:bg-iris-purple/10 border-iris-purple/20"}`}
              onClick={() => handleTokenSelect(token)}
            >
              {token}
            </Button>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-iris-purple/5 hover:bg-iris-purple/10 border-iris-purple/20 flex items-center"
            onClick={() => {
              const event = new CustomEvent('openCustomTokenModal');
              document.dispatchEvent(event);
            }}
          >
            + Add Custom
          </Button>
        </div>
      </div>
    </div>
  );

  // Step 3: Amount, Description, Evidence
  const renderStep3 = () => (
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <Label htmlFor="loss-amount" className="text-white">Estimated Loss Amount</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-secondary border border-r-0 border-iris-purple/20 rounded-l-md text-muted-foreground">
            $
          </span>
          <Input 
            id="lossAmount" 
            className="rounded-l-none bg-secondary border-iris-purple/20" 
            placeholder="0.00"
            value={formData.lossAmount}
            onChange={handleChange}
            type="number"
            min="0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Describe what happened and how the loss occurred" 
          className="bg-secondary border-iris-purple/20 min-h-[100px]"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="file-upload" className="text-white">Supporting Evidence (Optional)</Label>
        <div className="border-2 border-dashed border-iris-purple/20 rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-secondary hover:bg-iris-purple/5"
                onClick={() => {
                  setImagePreview(null);
                  setEvidenceFile(null);
                }}
              >
                Remove Image
              </Button>
            </div>
          ) : (
            <>
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag screenshots or files here, or click to browse
              </p>
              <Input 
                id="file-upload" 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-secondary hover:bg-iris-purple/5"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Upload Files
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Shield className="h-5 w-5 mr-2" />;
      case 2:
        return <FileText className="h-5 w-5 mr-2" />;
      case 3:
        return <DollarSign className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-iris-darker border-none shadow-lg max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Submit New Claim</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {currentStep === 1 && "Step 1: Select your wallet and transaction"}
            {currentStep === 2 && "Step 2: Identify affected assets and reason"}
            {currentStep === 3 && "Step 3: Provide loss details and evidence"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 mb-4">
          <Progress value={progress} className="h-2 bg-iris-purple/20" />
          <div className="flex justify-between mt-1">
            <div className="flex items-center">
              <div className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${currentStep >= 1 ? "bg-iris-purple text-white" : "bg-iris-purple/20 text-muted-foreground"}`}>
                {currentStep > 1 ? <Check className="h-3 w-3" /> : "1"}
              </div>
              <span className={`text-xs ml-1 ${currentStep >= 1 ? "text-white" : "text-muted-foreground"}`}>Wallet</span>
            </div>
            <div className="flex items-center">
              <div className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${currentStep >= 2 ? "bg-iris-purple text-white" : "bg-iris-purple/20 text-muted-foreground"}`}>
                {currentStep > 2 ? <Check className="h-3 w-3" /> : "2"}
              </div>
              <span className={`text-xs ml-1 ${currentStep >= 2 ? "text-white" : "text-muted-foreground"}`}>Assets</span>
            </div>
            <div className="flex items-center">
              <div className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${currentStep >= 3 ? "bg-iris-purple text-white" : "bg-iris-purple/20 text-muted-foreground"}`}>
                {currentStep > 3 ? <Check className="h-3 w-3" /> : "3"}
              </div>
              <span className={`text-xs ml-1 ${currentStep >= 3 ? "text-white" : "text-muted-foreground"}`}>Details</span>
            </div>
          </div>
        </div>
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        
        <DialogFooter className="flex justify-end space-x-3">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              className="border-iris-purple/30 hover:bg-iris-purple/5 flex items-center"
              onClick={prevStep}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button 
              className="neo-button flex items-center" 
              onClick={nextStep}
              disabled={loading}
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              className="neo-button flex items-center" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Claim"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimFormModal;
