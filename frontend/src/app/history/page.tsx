"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter, usePathname } from "next/navigation";
import {
  Clock,
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useEmailGuard } from "@/hooks/use-email-guard";
import { api, type Policy, type Claim, type PremiumPayment } from "@/lib/api";

const statusColor: Record<string, string> = {
  active: "border-[#00FFA3] text-[#00FFA3]",
  expired: "border-white/20 text-white/40",
  paid: "border-[#00FFA3] text-[#00FFA3]",
  pending: "border-yellow-400 text-yellow-400",
  rejected: "border-red-400 text-red-400",
  failed: "border-red-400 text-red-400",
};

type Tab = "timeline" | "payments";

export default function HistoryPage() {
  const { connected } = useWallet();
  const guardState = useEmailGuard();
  const router = useRouter();
  const pathname = usePathname();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [premiumPayments, setPremiumPayments] = useState<PremiumPayment[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("timeline");

  // Redirect to /setup if wallet connected but no email
  useEffect(() => {
    if (guardState === "needs-email") {
      router.push(`/setup?from=${encodeURIComponent(pathname)}`);
    }
  }, [guardState, router, pathname]);

  // Load policies, claims, and premium payments
  useEffect(() => {
    if (guardState !== "ok") return;
    setDataLoading(true);
    api
      .myPolicies()
      .then(async (fetchedPolicies) => {
        const [c, ...paymentSets] = await Promise.all([
          api.myClaims(),
          ...fetchedPolicies.map((p) =>
            api.premiumPayments(p.id).catch(() => [] as PremiumPayment[]),
          ),
        ]);
        setPolicies(fetchedPolicies);
        setClaims(c as Claim[]);
        const allPayments = (paymentSets as PremiumPayment[][]).flat();
        setPremiumPayments(
          allPayments.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [guardState]);

  // Merge policies + claims into unified timeline sorted newest first
  type TimelineItem =
    | { kind: "policy"; data: Policy; date: string }
    | { kind: "claim"; data: Claim; date: string };
  const timeline: TimelineItem[] = [
    ...policies.map((p) => ({
      kind: "policy" as const,
      data: p,
      date: p.createdAt,
    })),
    ...claims.map((c) => ({
      kind: "claim" as const,
      data: c,
      date: c.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const failedPayments = premiumPayments.filter((p) => p.status === "failed");

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 font-mono">
        <div className="border border-white/10 p-12 max-w-md w-full text-center">
          <Clock size={24} className="text-[#00FFA3] mx-auto mb-6" />
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ WALLET REQUIRED ]
          </p>
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">
            Connect to View History
          </h2>
          <p className="text-xs text-white/50 mb-8">
            Link your wallet to see all past policies and claims.
          </p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  if (guardState === "checking") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={24} className="text-[#00FFA3] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-1">
            [ History ]
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Policy & Claims History
          </h1>
        </div>
      </div>

      {/* Payment failure banner */}
      {failedPayments.length > 0 && (
        <div className="border-b border-red-500/30 bg-red-500/[0.06] px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-start gap-3">
            <AlertTriangle
              size={16}
              className="text-red-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-red-400 uppercase tracking-wide">
                {failedPayments.length} Premium Payment
                {failedPayments.length > 1 ? "s" : ""} Failed
              </p>
              <p className="text-xs text-red-300/70 mt-1">
                {failedPayments[0].failureReason ?? "Auto-collection failed."}{" "}
                Please ensure your USDC account has sufficient funds and the
                oracle&apos;s spending approval is still valid.
              </p>
              <button
                onClick={() => setTab("payments")}
                className="mt-2 text-xs text-red-400 underline underline-offset-2"
              >
                View payment history →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
          {[
            { label: "Total Policies", value: String(policies.length) },
            {
              label: "Active",
              value: String(
                policies.filter((p) => p.status === "active").length,
              ),
            },
            { label: "Claims Filed", value: String(claims.length) },
            {
              label: "Total Paid Out",
              value:
                claims
                  .filter((c) => c.status === "paid" && c.payoutAmount)
                  .reduce((s, c) => s + (c.payoutAmount ?? 0), 0) > 0
                  ? `$${claims
                      .filter((c) => c.status === "paid")
                      .reduce((s, c) => s + (c.payoutAmount ?? 0), 0)
                      .toLocaleString()}`
                  : "0",
            },
          ].map((s) => (
            <div key={s.label} className="bg-black px-6 py-4">
              <p className="text-xl font-black text-[#00FFA3]">{s.value}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/10 px-4">
        <div className="max-w-4xl mx-auto flex">
          {(
            [
              { id: "timeline", label: "Timeline" },
              {
                id: "payments",
                label: `On-Chain Payments${failedPayments.length > 0 ? ` (${failedPayments.length} failed)` : ""}`,
              },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 px-4 text-[10px] uppercase tracking-widest border-b-2 transition-colors ${
                tab === t.id
                  ? "border-[#00FFA3] text-[#00FFA3]"
                  : "border-transparent text-white/30 hover:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* ── Timeline tab ── */}
        {tab === "timeline" && (
          <>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              Chronological activity
            </p>
            <div className="space-y-px">
              {dataLoading ? (
                <div className="py-16 text-center">
                  <Loader2
                    size={20}
                    className="text-[#00FFA3] animate-spin mx-auto"
                  />
                </div>
              ) : timeline.length === 0 ? (
                <div className="border border-white/10 p-12 text-center">
                  <p className="text-xs text-white/30 uppercase tracking-widest">
                    No activity yet
                  </p>
                </div>
              ) : (
                timeline.map((item) => {
                  if (item.kind === "policy") {
                    const p = item.data;
                    return (
                      <div
                        key={p.id}
                        className="border border-white/10 p-6 bg-black hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Shield
                              size={14}
                              className="text-[#00FFA3] mt-0.5"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold uppercase">
                                  {p.productType} Insurance
                                </p>
                                <span className="text-[10px] text-white/30">
                                  #{p.id.slice(0, 8)}
                                </span>
                              </div>
                              <p className="text-xs text-white/40 mt-0.5">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-white/50 mt-1">
                                Coverage:{" "}
                                <span className="text-white/70">
                                  ${p.coverageAmount.toLocaleString()}
                                </span>
                                {" · "}Premium:{" "}
                                <span className="text-[#00FFA3]">
                                  $
                                  {p.monthlyPremium?.toFixed(2) ??
                                    p.premiumAmount}
                                  /mo {p.currency}
                                </span>
                              </p>
                              {p.nextPaymentDue && (
                                <p className="text-xs text-white/30 mt-1">
                                  Next payment:{" "}
                                  {new Date(
                                    p.nextPaymentDue,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              <p className="text-xs text-white/30 mt-1">
                                Expires{" "}
                                {new Date(p.endDate).toLocaleDateString()}
                              </p>
                              {p.premiumTxHash && (
                                <p className="text-[10px] text-white/20 mt-1">
                                  Tx:{" "}
                                  <a
                                    href={`https://explorer.solana.com/tx/${p.premiumTxHash}?cluster=devnet`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-white/40 hover:text-[#00FFA3] transition-colors"
                                  >
                                    {p.premiumTxHash.slice(0, 16)}…
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] border px-2 py-1 uppercase tracking-widest flex-shrink-0 ${statusColor[p.status] ?? ""}`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    const c = item.data;
                    return (
                      <div
                        key={c.id}
                        className="border border-white/10 p-6 bg-black hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <FileText
                              size={14}
                              className="text-white/50 mt-0.5"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold uppercase">
                                  Claim
                                </p>
                                <span className="text-[10px] text-white/30">
                                  #{c.id.slice(0, 8)}
                                </span>
                              </div>
                              <p className="text-xs text-white/40 mt-0.5">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-white/60 mt-1">
                                {c.description}
                              </p>
                              {c.payoutAmount && (
                                <p className="text-xs text-white/50 mt-1">
                                  Payout:{" "}
                                  <span className="text-[#00FFA3] font-bold">
                                    ${c.payoutAmount.toLocaleString()}
                                  </span>
                                </p>
                              )}
                              {c.payoutTxHash && (
                                <p className="text-[10px] text-white/20 mt-1">
                                  Tx:{" "}
                                  <a
                                    href={`https://explorer.solana.com/tx/${c.payoutTxHash}?cluster=devnet`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-white/40 hover:text-[#00FFA3] transition-colors"
                                  >
                                    {c.payoutTxHash.slice(0, 16)}…
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] border px-2 py-1 uppercase tracking-widest flex-shrink-0 ${statusColor[c.status] ?? ""}`}
                          >
                            {c.status}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </>
        )}

        {/* ── On-Chain Payments tab ── */}
        {tab === "payments" && (
          <>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              Automatic monthly premium collection records
            </p>
            {dataLoading ? (
              <div className="py-16 text-center">
                <Loader2
                  size={20}
                  className="text-[#00FFA3] animate-spin mx-auto"
                />
              </div>
            ) : premiumPayments.length === 0 ? (
              <div className="border border-white/10 p-12 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  No payment records yet
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {premiumPayments.map((pay) => {
                  const isFailed = pay.status === "failed";
                  return (
                    <div
                      key={pay.id}
                      className={`border p-5 bg-black transition-colors ${
                        isFailed
                          ? "border-red-500/30 bg-red-500/[0.04]"
                          : "border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {isFailed ? (
                            <AlertCircle
                              size={14}
                              className="text-red-400 mt-0.5 flex-shrink-0"
                            />
                          ) : (
                            <CheckCircle
                              size={14}
                              className="text-[#00FFA3] mt-0.5 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold uppercase">
                                {isFailed
                                  ? "PAYMENT FAILED"
                                  : "Premium Collected"}
                              </p>
                              <span className="text-[10px] text-white/30">
                                month #{pay.paymentIndex + 1}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 mt-0.5">
                              {new Date(pay.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              Amount:{" "}
                              <span
                                className={
                                  isFailed ? "text-red-300" : "text-[#00FFA3]"
                                }
                              >
                                {pay.amount.toFixed(2)} USDC
                              </span>
                            </p>
                            <p className="text-[10px] text-white/30 mt-1 font-mono">
                              policy: {pay.policyId.slice(0, 12)}…
                            </p>
                            {isFailed && pay.failureReason && (
                              <p className="text-[10px] text-red-400/70 mt-1">
                                {pay.failureReason}
                              </p>
                            )}
                            {pay.txHash && (
                              <a
                                href={`https://explorer.solana.com/tx/${pay.txHash}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-white/40 hover:text-[#00FFA3] transition-colors mt-1"
                              >
                                <ExternalLink size={10} />
                                {pay.txHash.slice(0, 20)}…
                              </a>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] border px-2 py-1 uppercase tracking-widest flex-shrink-0 ${statusColor[pay.status] ?? ""}`}
                        >
                          {pay.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
