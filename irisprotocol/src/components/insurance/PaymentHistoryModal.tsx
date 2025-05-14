
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PaymentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: { date: string; plan: string; duration: string; amount: string; status: string };
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ open, onOpenChange, history }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-iris-darker border border-iris-purple/20 max-w-md">
      <DialogHeader>
        <DialogTitle className="text-white">Payment Details</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Detailed info for your insurance payment.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2 mt-2">
        <div><span className="font-semibold text-white/90">Plan:</span> {history.plan}</div>
        <div><span className="font-semibold text-white/90">Date:</span> {history.date}</div>
        <div><span className="font-semibold text-white/90">Duration:</span> {history.duration}</div>
        <div><span className="font-semibold text-white/90">Paid Amount:</span> {history.amount}</div>
        <div><span className="font-semibold text-white/90">Status:</span> {history.status}</div>
      </div>
    </DialogContent>
  </Dialog>
);
export default PaymentHistoryModal;
