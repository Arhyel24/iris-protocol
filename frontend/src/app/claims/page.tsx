"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useEmailGuard } from "@/hooks/use-email-guard";
import { api, type Policy, type Claim } from "@/lib/api";

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock size={12} className="text-yellow-400" />,
  approved: <CheckCircle size={12} className="text-[#00FFA3]" />,
  paid: <CheckCircle size={12} className="text-[#00FFA3]" />,
  rejected: <AlertCircle size={12} className="text-red-400" />,
};

const statusColor: Record<string, string> = {
  paid: "border-[#00FFA3] text-[#00FFA3]",
  pending: "border-yellow-400 text-yellow-400",
  approved: "border-[#00FFA3] text-[#00FFA3]",
  rejected: "border-red-400 text-red-400",
};

export default function ClaimsPage() {
  const { connected } = useWallet();
  const guardState = useEmailGuard();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<"file" | "history">("file");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [policy, setPolicy] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (guardState !== "ok") return;
    setDataLoading(true);
    Promise.all([api.myPolicies(), api.myClaims()])
      .then(([p, c]) => {
        setPolicies(p);
        setClaims(c);
        const active = p.filter((x) => x.status === "active");
        if (active.length > 0) setPolicy(active[0].id);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [guardState]);

  // Redirect to /setup if wallet connected but no email
  useEffect(() => {
    if (guardState === "needs-email") {
      router.push(`/setup?from=${encodeURIComponent(pathname)}`);
    }
  }, [guardState, router, pathname]);

  async function handleSubmit() {
    if (!policy || !desc || !date) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.fileClaim({
        policyId: policy,
        description: desc,
        incidentDate: new Date(date).toISOString(),
      });
      setSubmitted(true);
      // Refresh claims list
      api
        .myClaims()
        .then(setClaims)
        .catch(() => {});
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit claim.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 font-mono">
        <div className="border border-white/10 p-12 max-w-md w-full text-center">
          <FileText size={24} className="text-[#00FFA3] mx-auto mb-6" />
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ WALLET REQUIRED ]
          </p>
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">
            Connect to File Claims
          </h2>
          <p className="text-xs text-white/50 mb-8">
            Link your wallet to access claims for your policies.
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
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-1">
            [ Claims ]
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Claims Center
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-4">
        <div className="max-w-3xl mx-auto flex">
          {(["file", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs uppercase tracking-widest border-b-2 transition-colors ${
                tab === t
                  ? "border-[#00FFA3] text-[#00FFA3]"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              {t === "file" ? "File a Claim" : "Claim History"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* File claim tab */}
        {tab === "file" && !submitted && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              Submit a claim against an active policy
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Policy
                </label>
                <select
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#00FFA3] transition-colors"
                >
                  {dataLoading ? (
                    <option>Loading policies…</option>
                  ) : policies.length === 0 ? (
                    <option disabled>No active policies</option>
                  ) : (
                    policies
                      .filter((p) => p.status === "active")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id.slice(0, 8)} — {p.productType} Insurance
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Incident Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#00FFA3] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe what happened in detail..."
                  className="w-full bg-black border border-white/20 px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#00FFA3] transition-colors resize-none placeholder-white/20"
                />
              </div>

              <div className="border border-white/10 p-4 bg-white/[0.02]">
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Proof / Evidence (optional)
                </label>
                <p className="text-xs text-white/30">
                  Upload receipts, photos, or documents. Stored as IPFS hash
                  on-chain.
                </p>
                <input
                  type="file"
                  className="mt-3 text-xs text-white/40 file:border file:border-white/20 file:bg-transparent file:text-white/50 file:text-xs file:px-4 file:py-2 file:mr-4 file:uppercase file:tracking-widest"
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-400">{submitError}</p>
              )}

              <button
                disabled={
                  !desc ||
                  !date ||
                  !policy ||
                  submitting ||
                  policies.filter((p) => p.status === "active").length === 0
                }
                onClick={handleSubmit}
                className="w-full bg-[#00FFA3] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white text-black font-bold text-sm py-4 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting…
                  </>
                ) : (
                  "Submit Claim"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Submitted confirmation */}
        {tab === "file" && submitted && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#00FFA3]/10 border border-[#00FFA3] flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-[#00FFA3]" />
            </div>
            <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
              [ CLAIM SUBMITTED ]
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
              Claim Filed
            </h2>
            <p className="text-sm text-white/50 max-w-sm mx-auto mb-8">
              Your claim has been submitted. The insurance API will validate
              your event. Once approved, the escrow will release your payout
              automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setTab("history");
                  setSubmitted(false);
                }}
                className="border border-white/20 hover:border-[#00FFA3] text-white/60 hover:text-[#00FFA3] text-sm px-6 py-3 uppercase tracking-widest transition-colors"
              >
                View History
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-[#00FFA3] hover:bg-white text-black font-bold text-sm px-6 py-3 uppercase tracking-widest transition-colors"
              >
                File Another
              </button>
            </div>
          </div>
        )}

        {/* Claims history tab */}
        {tab === "history" && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              All claims across your policies
            </p>
            {claims.length === 0 ? (
              <div className="border border-white/10 p-12 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  No claims found
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {claims.map((c) => (
                  <div
                    key={c.id}
                    className="border border-white/10 p-6 bg-black hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-bold uppercase">
                          {c.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          Policy {c.policyId.slice(0, 8)} ·{" "}
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusIcon[c.status]}
                        <span
                          className={`text-[10px] border px-1.5 py-0.5 uppercase tracking-widest ${statusColor[c.status] ?? ""}`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-white/60 mb-3">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">
                        {c.payoutAmount != null ? (
                          <>
                            Payout:{" "}
                            <span className="text-[#00FFA3] font-bold">
                              ${c.payoutAmount.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          (() => {
                            const pol = policies.find(
                              (p) => p.id === c.policyId,
                            );
                            return (
                              <>
                                Coverage:{" "}
                                <span className="text-white/70 font-bold">
                                  {pol
                                    ? `$${pol.coverageAmount.toLocaleString()}`
                                    : "Pending review"}
                                </span>
                              </>
                            );
                          })()
                        )}
                      </span>
                      {c.payoutTxHash && (
                        <span className="text-white/30">
                          Tx:{" "}
                          <span className="text-[#00FFA3]">
                            {c.payoutTxHash.slice(0, 10)}…
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
