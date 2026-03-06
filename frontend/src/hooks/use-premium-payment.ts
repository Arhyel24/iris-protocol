/**
 * usePremiumPayments
 * ==================
 * React Query hook that fetches the on-chain premium payment history for a
 * given policy and exposes helpers for the UI:
 *
 *  - `payments`       — all records (paid + failed)
 *  - `failedPayments` — only the ones where status === "failed"
 *  - `hasFailure`     — boolean shorthand for showing the warning banner
 *  - `latestFailure`  — the most recent failure record (for the banner message)
 *  - `isLoading`      — true while fetching
 *  - `refetch`        — manually re-fetch (call after a manual retry)
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type PremiumPayment } from "@/lib/api";

export function usePremiumPayments(policyId: string | null | undefined) {
  const { data, isLoading, error, refetch } = useQuery<PremiumPayment[]>({
    queryKey: ["premium-payments", policyId],
    queryFn: () => api.premiumPayments(policyId!),
    enabled: !!policyId,
    // Poll every 5 minutes so the UI reflects scheduler results without a manual refresh
    refetchInterval: 5 * 60 * 1_000,
    staleTime: 60_000,
  });

  const payments = data ?? [];
  const failedPayments = payments.filter((p) => p.status === "failed");
  const hasFailure = failedPayments.length > 0;
  // Most recent failure (records are returned newest-first by the API)
  const latestFailure = failedPayments[0] ?? null;

  return {
    payments,
    failedPayments,
    hasFailure,
    latestFailure,
    isLoading,
    error,
    refetch,
  };
}
