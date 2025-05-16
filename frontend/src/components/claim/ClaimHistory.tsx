
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClaimHistoryItem {
  id: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  amount: string;
  reason: string;
}

interface ClaimHistoryProps {
  claims: ClaimHistoryItem[];
  onRowClick?: (claim: ClaimHistoryItem) => void;
  loading?: boolean;
}

const ClaimHistory: React.FC<ClaimHistoryProps> = ({ claims, onRowClick, loading = false }) => {
  const getStatusBadge = (status: ClaimHistoryItem["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-iris-yellow/20 text-iris-yellow border-iris-yellow/30">Pending</Badge>;
      case "approved":
        return <Badge className="bg-iris-green/20 text-iris-green border-iris-green/30">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-iris-red/20 text-iris-red border-iris-red/30">Rejected</Badge>;
    }
  };

  return (
    <Card className="glass-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Claim History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-700/40 rounded"></div>
              <div className="h-10 bg-slate-700/30 rounded"></div>
              <div className="h-10 bg-slate-700/20 rounded"></div>
            </div>
          ) : claims.length > 0 ? (
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className={onRowClick ? "cursor-pointer hover:bg-secondary/70" : ""}
                    onClick={() => onRowClick?.(claim)}
                  >
                    <td className="font-medium text-white">{claim.id}</td>
                    <td>{claim.date}</td>
                    <td>{getStatusBadge(claim.status)}</td>
                    <td className="font-medium">{claim.amount}</td>
                    <td className="max-w-[200px] truncate">{claim.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No claims found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaimHistory;
