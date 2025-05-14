
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToken: (token: { symbol: string; address: string }) => void;
}

const CustomTokenDialog: React.FC<CustomTokenDialogProps> = ({ open, onOpenChange, onAddToken }) => {
  const [customToken, setCustomToken] = useState({ symbol: "", address: "" });
  
  const handleAddCustomToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (customToken.symbol.trim()) {
      onAddToken(customToken);
      setCustomToken({ symbol: "", address: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-iris-darker border border-iris-purple/20">
        <DialogHeader>
          <DialogTitle className="text-white">Add Custom Token</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the details of your custom token to include it in your claim.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6 mt-4" onSubmit={handleAddCustomToken}>
          <div>
            <Label className="text-white text-sm font-medium block mb-1" htmlFor="token-symbol">Token Symbol</Label>
            <Input 
              className="w-full p-2 rounded-md bg-secondary border border-iris-purple/20 text-white" 
              id="token-symbol" 
              placeholder="e.g. RENDER" 
              value={customToken.symbol}
              onChange={(e) => setCustomToken({...customToken, symbol: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-white text-sm font-medium block mb-1" htmlFor="token-address">Token Address</Label>
            <Input 
              className="w-full p-2 rounded-md bg-secondary border border-iris-purple/20 text-white" 
              id="token-address" 
              placeholder="e.g. 9xQeW..." 
              value={customToken.address}
              onChange={(e) => setCustomToken({...customToken, address: e.target.value})}
            />
          </div>
          <Button className="neo-button w-full" type="submit">Add Token</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTokenDialog;
