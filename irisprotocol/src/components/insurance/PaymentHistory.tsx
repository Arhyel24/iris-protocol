
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPaymentHistory } from "@/services/insuranceService";
import { format, parseISO } from "date-fns";

interface PaymentHistoryProps {
  insuranceId?: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ insuranceId }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { data, error } = await getPaymentHistory();
        if (data && !error) {
          // Filter payments by insuranceId if provided
          const filteredData = insuranceId 
            ? data.filter(payment => payment.insurance_id === insuranceId)
            : data;
          setPayments(filteredData);
        }
      } catch (err) {
        console.error("Error fetching payment history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [insuranceId]);

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-iris-green/20 text-iris-green border-iris-green/30";
      case "pending":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  return (
    <Card className="glass-card border-none shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-700/40 rounded"></div>
            <div className="h-10 bg-slate-700/30 rounded"></div>
            <div className="h-10 bg-slate-700/20 rounded"></div>
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td className="font-medium">{formatAmount(payment.amount)}</td>
                    <td className="capitalize">
                      {payment.payment_method === 'demo' ? 'Credit Card' : payment.payment_method}
                    </td>
                    <td>
                      <Badge className={getBadgeClass(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td>
                      {payment.insurance_policies?.tier || 'Basic'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No payment history found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
