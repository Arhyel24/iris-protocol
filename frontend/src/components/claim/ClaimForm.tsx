
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createClaim } from "@/services/claimService";
import { sendNotification } from "@/services/notificationService";
import { getActiveInsurancePolicy } from "@/services/insuranceService";

interface ClaimFormProps {
  affectedTokens: string[];
  onSubmit: (claimData: any) => void;
}

const ClaimForm: React.FC<ClaimFormProps> = ({ affectedTokens, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    transactionHash: "",
    reason: "",
    lossAmount: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [activeInsurance, setActiveInsurance] = useState<any>(null);
  
  const { toast } = useToast();
  const { wallets, user } = useAuth();

  useEffect(() => {
    const fetchActiveInsurance = async () => {
      const { data } = await getActiveInsurancePolicy();
      if (data) {
        setActiveInsurance(data);
      }
    };
    
    fetchActiveInsurance();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  const handleSubmit = async () => {
    if (!wallets || wallets.length === 0) {
      toast({
        title: "No wallet available",
        description: "Please add a wallet before submitting a claim",
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
    
    // Get primary wallet or first wallet
    const primaryWallet = wallets.find(w => w.is_primary) || wallets[0];
    
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
      
      const { data, error } = await createClaim({
        wallet_id: activeInsurance.wallet_id,
        insurance_id: activeInsurance.id,
        amount: amount,
        reason: reasonMap[formData.reason] || formData.reason,
        description: formData.description,
        transaction_hash: formData.transactionHash || undefined,
        affected_assets: selectedTokens
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
      
      // Reset form
      setSelectedTokens([]);
      setFormData({
        transactionHash: "",
        reason: "",
        lossAmount: "",
        description: ""
      });
      setImagePreview(null);
      
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

  return (
    <Card className="glass-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Submit New Claim</CardTitle>
        <CardDescription className="text-muted-foreground">
          If you've experienced a loss that wasn't automatically covered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="transaction-hash" className="text-white">Transaction Hash</Label>
          <Input 
            id="transactionHash" 
            placeholder="Enter the transaction hash related to the loss" 
            className="bg-secondary border-iris-purple/20"
            value={formData.transactionHash}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">The Solana transaction where the loss occurred</p>
        </div>
        
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
                  onClick={() => setImagePreview(null)}
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
      </CardContent>
      <CardFooter className="flex justify-end space-x-3">
        <Button variant="outline" className="border-iris-purple/30 hover:bg-iris-purple/5">
          Cancel
        </Button>
        <Button 
          className="neo-button" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Claim"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClaimForm;
