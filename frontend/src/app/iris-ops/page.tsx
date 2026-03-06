"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Shield,
  Users,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  ChevronDown,
  Loader2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Link,
  Server,
  Clock,
} from "lucide-react";
import {
  adminApi,
  tokenStore,
  type AdminStats,
  type AdminUser,
  type AdminPolicy,
  type AdminClaim,
  type ChainStatus,
  type ActivityLogEntry,
} from "@/lib/api";

type Tab = "overview" | "claims" | "policies" | "users" | "chain" | "activity";

/** OTP flow step */
type OtpStep = "idle" | "sending" | "waiting" | "verifying" | "done";

const statusBadge: Record<string, string> = {
  active: "border-[#00FFA3] text-[#00FFA3]",
  pending: "border-yellow-400 text-yellow-400",
  paid: "border-[#00FFA3] text-[#00FFA3]",
  approved: "border-[#00FFA3] text-[#00FFA3]",
  rejected: "border-red-400 text-red-400",
  expired: "border-white/20 text-white/40",
  cancelled: "border-white/20 text-white/40",
  admin: "border-purple-400 text-purple-400",
  user: "border-white/30 text-white/40",
};

function Badge({ value }: { value: string }) {
  return (
    <span
      className={`text-[10px] border px-1.5 py-0.5 uppercase tracking-widest ${statusBadge[value] ?? "border-white/20 text-white/40"}`}
    >
      {value}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="border border-white/10 p-5 bg-black">
      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-3xl font-black text-[#00FFA3] font-mono">{value}</p>
      {sub && <p className="text-[10px] text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

// â”€â”€ OTP Gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OtpGate({
  wallet,
  onVerified,
}: {
  wallet: string;
  onVerified: () => void;
}) {
  const [step, setStep] = useState<OtpStep>("idle");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function requestOtp() {
    setStep("sending");
    setErr("");
    try {
      const res = await adminApi.requestOtp(wallet);
      setMsg(res.message);
      setStep("waiting");
    } catch (e) {
      setErr((e as Error).message);
      setStep("idle");
    }
  }

  async function verifyOtp() {
    setStep("verifying");
    setErr("");
    try {
      await adminApi.verifyOtp(wallet, code.trim());
      sessionStorage.setItem("iris_otp_ok", wallet);
      setStep("done");
      onVerified();
    } catch (e) {
      setErr((e as Error).message);
      setStep("waiting");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
      <div className="border border-white/10 p-10 max-w-sm w-full text-center">
        <p className="text-[10px] text-[#00FFA3] uppercase tracking-widest mb-2">
          [ Admin Portal ]
        </p>
        <p className="text-lg font-black uppercase mb-6">
          Identity Verification
        </p>

        {step === "idle" && (
          <>
            <p className="text-xs text-white/40 mb-6">
              A one-time code will be sent to the email registered with this
              admin wallet.
            </p>
            <p className="text-[10px] font-mono text-white/30 mb-6 break-all">
              {wallet.slice(0, 20)}...
            </p>
            <button
              onClick={requestOtp}
              className="w-full bg-[#00FFA3] hover:bg-white text-black font-bold text-xs py-3 uppercase tracking-widest"
            >
              Send OTP
            </button>
          </>
        )}

        {step === "sending" && (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="text-[#00FFA3] animate-spin" />
          </div>
        )}

        {(step === "waiting" || step === "verifying") && (
          <>
            <p className="text-xs text-[#00FFA3] mb-4">{msg}</p>
            <p className="text-xs text-white/40 mb-4">
              Enter the 6-digit code from your email:
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && code.length === 6) verifyOtp();
              }}
              placeholder="000000"
              className="w-full bg-black border border-white/20 px-4 py-3 text-2xl text-white font-mono text-center tracking-[0.4em] outline-none focus:border-[#00FFA3] mb-4"
            />
            <button
              onClick={verifyOtp}
              disabled={code.length !== 6 || step === "verifying"}
              className="w-full bg-[#00FFA3] hover:bg-white disabled:opacity-40 text-black font-bold text-xs py-3 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {step === "verifying" && (
                <Loader2 size={12} className="animate-spin" />
              )}
              Verify Code
            </button>
            <button
              onClick={() => {
                setStep("idle");
                setCode("");
                setMsg("");
                setErr("");
              }}
              className="mt-3 text-xs text-white/30 underline underline-offset-2 hover:text-white/60"
            >
              Resend OTP
            </button>
          </>
        )}

        {err && <p className="text-xs text-red-400 mt-4">{err}</p>}
      </div>
    </div>
  );
}

// â”€â”€ Claim review modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ReviewModal({
  claim,
  onClose,
  onDone,
  signMsg,
}: {
  claim: AdminClaim;
  onClose: () => void;
  onDone: (updated: AdminClaim) => void;
  signMsg?: (msg: string) => Promise<string | null>;
}) {
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [payout, setPayout] = useState(String(claim.coverageAmount));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setLoading(true);
    setErr("");
    try {
      // Request admin wallet signature for the action
      let adminSignature: string | undefined;
      if (signMsg) {
        const msgToSign = `IRIS Admin Action Authorization\nClaim: ${claim.id}\nDecision: ${decision}`;
        const sig = await signMsg(msgToSign);
        if (!sig) throw new Error("Wallet signature cancelled.");
        adminSignature = sig;
      }

      const result = await adminApi.reviewClaim(claim.id, {
        decision,
        reviewNote: note || undefined,
        payoutAmount: decision === "approved" ? Number(payout) : undefined,
        adminSignature,
      });
      onDone(result);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="border border-white/20 bg-black w-full max-w-lg p-6 font-mono">
        <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-1">
          [ Review Claim ]
        </p>
        <p className="text-lg font-black uppercase mb-4">
          {claim.id.slice(0, 8)}
        </p>

        <div className="space-y-1 text-xs text-white/50 mb-5 border border-white/10 p-4">
          <p>
            Policy{" "}
            <span className="text-white/70">{claim.policyId.slice(0, 8)}</span>{" "}
            · {claim.productType}
          </p>
          <p>
            User{" "}
            <span className="text-white/70">
              {claim.userWallet.slice(0, 12)}...
            </span>
          </p>
          <p>
            Coverage{" "}
            <span className="text-white">
              ${claim.coverageAmount.toLocaleString()}
            </span>
          </p>
          <p className="text-white/70 mt-2">{claim.description}</p>
        </div>

        <div className="flex gap-2 mb-4">
          {(["approved", "rejected"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDecision(d)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest border transition-colors ${
                decision === d
                  ? d === "approved"
                    ? "bg-[#00FFA3] border-[#00FFA3] text-black font-bold"
                    : "bg-red-500 border-red-500 text-white font-bold"
                  : "border-white/20 text-white/40 hover:border-white/40"
              }`}
            >
              {d === "approved" ? "Approve" : "Reject"}
            </button>
          ))}
        </div>

        {decision === "approved" && (
          <div className="mb-4">
            <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">
              Payout Amount (USDC)
            </label>
            <input
              type="number"
              step="0.01"
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
              className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#00FFA3]"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">
            Review Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-black border border-white/20 px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#00FFA3] resize-none"
            placeholder="Internal note..."
          />
        </div>

        {signMsg && (
          <p className="text-[10px] text-yellow-400/60 mb-4 flex items-center gap-1">
            <AlertTriangle size={10} /> Your wallet will be asked to sign this
            action.
          </p>
        )}

        {err && <p className="text-xs text-red-400 mb-3">{err}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-white/20 text-white/50 text-xs py-3 uppercase tracking-widest hover:border-white/40"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-[#00FFA3] hover:bg-white disabled:opacity-40 text-black font-bold text-xs py-3 uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Policy status dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PolicyStatusSelect({
  policy,
  onUpdate,
}: {
  policy: AdminPolicy;
  onUpdate: (u: AdminPolicy) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function change(s: string) {
    if (s === policy.status) return;
    setLoading(true);
    try {
      const updated = await adminApi.setPolicyStatus(policy.id, s);
      onUpdate(updated as AdminPolicy);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex items-center gap-1">
      {loading && <Loader2 size={10} className="text-white/40 animate-spin" />}
      <select
        value={policy.status}
        onChange={(e) => change(e.target.value)}
        className="bg-black border border-white/20 text-[10px] text-white/70 px-2 py-1 uppercase font-mono outline-none focus:border-[#00FFA3] cursor-pointer"
      >
        {["active", "expired", "cancelled"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

// â”€â”€ Main admin portal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminPortal() {
  const { connected, publicKey, signMessage } = useWallet();

  // â”€â”€ OTP / access gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [otpVerified, setOtpVerified] = useState(false);
  const [roleOk, setRoleOk] = useState(false);

  useEffect(() => {
    // Check if OTP was already verified this session (for this wallet)
    const walletStr = publicKey?.toBase58() ?? "";
    const stored = sessionStorage.getItem("iris_otp_ok");
    if (stored && stored === walletStr) {
      setOtpVerified(true);
    } else {
      setOtpVerified(false);
    }
    // Check admin role from JWT
    try {
      const u = tokenStore.getUser<{ role: string }>();
      setRoleOk(u?.role === "admin");
    } catch {
      setRoleOk(false);
    }
  }, [publicKey]);

  // â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [policies, setPolicies] = useState<AdminPolicy[]>([]);
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataErr, setDataErr] = useState("");
  const [claimFilter, setClaimFilter] = useState("pending");
  const [activityFilter, setActivityFilter] = useState("");
  const [reviewingClaim, setReviewingClaim] = useState<AdminClaim | null>(null);

  // Helper: sign a message with the admin wallet
  async function adminSign(msg: string): Promise<string | null> {
    if (!signMessage) return null;
    try {
      const encoded = new TextEncoder().encode(msg);
      const sig = await signMessage(encoded);
      return Buffer.from(sig).toString("base64");
    } catch {
      return null;
    }
  }

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setDataErr("");
    try {
      const [s, u, p, c, cs, a] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        adminApi.policies(),
        adminApi.claims(claimFilter || undefined),
        adminApi.chainStatus(),
        adminApi.activity(undefined, 50),
      ]);
      setStats(s);
      setUsers(u);
      setPolicies(p);
      setClaims(c);
      setChainStatus(cs);
      setActivity(a);
    } catch (e) {
      setDataErr((e as Error).message ?? "Failed to load data.");
    } finally {
      setDataLoading(false);
    }
  }, [claimFilter]);

  useEffect(() => {
    if (roleOk && otpVerified) loadAll();
  }, [roleOk, otpVerified, loadAll]);

  useEffect(() => {
    if (!roleOk || !otpVerified) return;
    adminApi
      .claims(claimFilter || undefined)
      .then(setClaims)
      .catch(() => {});
  }, [claimFilter, roleOk, otpVerified]);

  useEffect(() => {
    if (!roleOk || !otpVerified) return;
    adminApi
      .activity(activityFilter || undefined, 100)
      .then(setActivity)
      .catch(() => {});
  }, [activityFilter, roleOk, otpVerified]);

  // â”€â”€ Wallet not connected â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
        <div className="border border-white/10 p-10 max-w-sm w-full text-center">
          <AlertTriangle size={20} className="text-yellow-400 mx-auto mb-4" />
          <p className="text-xs text-white/50 uppercase tracking-widest">
            Connect your admin wallet to continue.
          </p>
        </div>
      </div>
    );
  }

  // â”€â”€ Role check: not admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!roleOk) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
        <div className="border border-white/10 p-10 max-w-sm w-full text-center">
          <AlertTriangle size={20} className="text-red-400 mx-auto mb-4" />
          <p className="text-xs text-red-400 uppercase tracking-widest">
            Not found.
          </p>
        </div>
      </div>
    );
  }

  // â”€â”€ OTP gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!otpVerified) {
    return (
      <OtpGate
        wallet={publicKey.toBase58()}
        onVerified={() => setOtpVerified(true)}
      />
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Activity size={12} /> },
    { id: "claims", label: "Claims", icon: <FileText size={12} /> },
    { id: "policies", label: "Policies", icon: <Shield size={12} /> },
    { id: "users", label: "Users", icon: <Users size={12} /> },
    { id: "chain", label: "Chain", icon: <Server size={12} /> },
    { id: "activity", label: "Activity", icon: <Clock size={12} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {reviewingClaim && (
        <ReviewModal
          claim={reviewingClaim}
          onClose={() => setReviewingClaim(null)}
          signMsg={adminSign}
          onDone={(updated) => {
            setClaims((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c)),
            );
            setReviewingClaim(null);
            adminApi
              .stats()
              .then(setStats)
              .catch(() => {});
          }}
        />
      )}

      {/* Header */}
      <div className="border-b border-white/10 px-4 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#00FFA3] uppercase tracking-widest">
            [ IRIS Ops Console ]
          </p>
          <h1 className="text-xl font-black uppercase tracking-tight mt-0.5">
            Admin Portal
          </h1>
        </div>
        <button
          onClick={loadAll}
          disabled={dataLoading}
          className="border border-white/20 hover:border-[#00FFA3] text-white/50 hover:text-[#00FFA3] p-2 transition-colors disabled:opacity-30"
          title="Refresh"
        >
          <RefreshCw size={14} className={dataLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-4">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-[#00FFA3] text-[#00FFA3]"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              {t.icon} {t.label}
              {t.id === "claims" && stats?.pendingClaims ? (
                <span className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {stats.pendingClaims}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {dataErr && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="border border-red-500/30 bg-red-500/[0.06] p-4 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle size={12} /> {dataErr}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* â”€â”€ Overview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {tab === "overview" && (
          <div>
            {dataLoading || !stats ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="text-[#00FFA3] animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-px">
                  <StatCard label="Total Users" value={stats.totalUsers} />
                  <StatCard
                    label="Total Policies"
                    value={stats.totalPolicies}
                    sub={`${stats.activePolicies} active`}
                  />
                  <StatCard
                    label="Pending Claims"
                    value={stats.pendingClaims}
                  />
                  <StatCard
                    label="Premium Collected"
                    value={`$${stats.totalPremiumCollected.toLocaleString()}`}
                    sub="USDC"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px mt-px">
                  <StatCard
                    label="Approved Claims"
                    value={stats.approvedClaims}
                  />
                  <StatCard
                    label="Rejected Claims"
                    value={stats.rejectedClaims}
                  />
                  <StatCard
                    label="Active Policies"
                    value={stats.activePolicies}
                  />
                </div>
                {chainStatus && (
                  <div className="mt-6 border border-white/10 p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                        Oracle SOL
                      </p>
                      <p className="text-lg font-black text-[#00FFA3] font-mono">
                        {chainStatus.oracleSolBalance.toFixed(4)} SOL
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                        Treasury USDC
                      </p>
                      <p className="text-lg font-black text-[#00FFA3] font-mono">
                        ${chainStatus.treasuryUsdcBalance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                        Network
                      </p>
                      <p className="text-lg font-black text-white font-mono uppercase">
                        {chainStatus.cluster}
                      </p>
                    </div>
                  </div>
                )}
                {stats.pendingClaims > 0 && (
                  <div className="mt-6 border border-yellow-400/20 bg-yellow-400/[0.04] p-5">
                    <p className="text-xs text-yellow-400 uppercase tracking-widest mb-1">
                      {stats.pendingClaims} pending claim
                      {stats.pendingClaims !== 1 ? "s" : ""} require review
                    </p>
                    <button
                      onClick={() => setTab("claims")}
                      className="text-xs text-yellow-400 underline underline-offset-2"
                    >
                      Review now â†’
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* â”€â”€ Claims â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {tab === "claims" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-white/40 uppercase tracking-widest">
                Claim review queue
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">
                  Filter:
                </span>
                <select
                  value={claimFilter}
                  onChange={(e) => setClaimFilter(e.target.value)}
                  className="bg-black border border-white/20 text-xs text-white/70 px-3 py-1.5 font-mono outline-none focus:border-[#00FFA3]"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {dataLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="text-[#00FFA3] animate-spin" />
              </div>
            ) : claims.length === 0 ? (
              <div className="border border-white/10 p-12 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  No claims
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {claims.map((c) => (
                  <div
                    key={c.id}
                    className="border border-white/10 p-5 bg-black hover:bg-white/[0.015]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold">
                            {c.id.slice(0, 8)}
                          </span>
                          <Badge value={c.status} />
                          <span className="text-[10px] text-white/30">
                            {c.productType}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 mb-1">
                          User:{" "}
                          <span className="font-mono text-white/60">
                            {c.userWallet.slice(0, 16)}...
                          </span>
                          {c.userEmail && <> · {c.userEmail}</>}
                        </p>
                        <p className="text-[10px] text-white/40 mb-2">
                          Policy {c.policyId.slice(0, 8)} · Coverage{" "}
                          <span className="text-white/70">
                            ${c.coverageAmount.toLocaleString()}
                          </span>
                          {" · "}Incident{" "}
                          {new Date(c.incidentDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-white/60 mb-2">
                          {c.description}
                        </p>
                        {c.payoutAmount != null && (
                          <p className="text-xs">
                            Payout:{" "}
                            <span className="text-[#00FFA3] font-bold">
                              ${c.payoutAmount.toLocaleString()}
                            </span>
                            {c.payoutTxHash && (
                              <a
                                href={`https://explorer.solana.com/tx/${c.payoutTxHash}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-2 text-white/30 hover:text-[#00FFA3]"
                              >
                                <ExternalLink size={10} className="inline" />
                              </a>
                            )}
                          </p>
                        )}
                        {c.reviewNote && (
                          <p className="text-[10px] text-white/30 mt-1">
                            Note: {c.reviewNote}
                          </p>
                        )}
                      </div>
                      {c.status === "pending" && (
                        <button
                          onClick={() => setReviewingClaim(c)}
                          className="flex-shrink-0 border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 text-[10px] px-3 py-2 uppercase tracking-widest transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Policies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {tab === "policies" && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              All policies
            </p>
            {dataLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="text-[#00FFA3] animate-spin" />
              </div>
            ) : policies.length === 0 ? (
              <div className="border border-white/10 p-12 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  No policies
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {policies.map((p) => (
                  <div
                    key={p.id}
                    className="border border-white/10 p-5 bg-black"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold">
                            {p.id.slice(0, 8)}
                          </span>
                          <Badge value={p.status} />
                          <span className="text-[10px] text-white/30 uppercase">
                            {p.productType}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 mb-1">
                          <span className="font-mono">
                            {p.userWallet.slice(0, 16)}...
                          </span>
                          {p.userEmail && <> · {p.userEmail}</>}
                        </p>
                        <p className="text-[10px] text-white/40">
                          Coverage{" "}
                          <span className="text-white/70">
                            ${p.coverageAmount.toLocaleString()}
                          </span>
                          {" · "}Premium{" "}
                          <span className="text-white/70">
                            ${p.monthlyPremium.toFixed(2)}/mo
                          </span>
                          {" · "}
                          {p.paymentsCount}/{p.durationMonths} paid
                          {" · "}Ends{" "}
                          {new Date(p.endDate).toLocaleDateString()}
                        </p>
                        {p.premiumTxHash && (
                          <p className="text-[10px] text-white/20 mt-1">
                            First tx:{" "}
                            <a
                              href={`https://explorer.solana.com/tx/${p.premiumTxHash}?cluster=devnet`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono hover:text-[#00FFA3]"
                            >
                              {p.premiumTxHash.slice(0, 14)}...
                            </a>
                          </p>
                        )}
                      </div>
                      <PolicyStatusSelect
                        policy={p}
                        onUpdate={(updated) =>
                          setPolicies((prev) =>
                            prev.map((x) =>
                              x.id === updated.id ? updated : x,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {tab === "users" && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              All users
            </p>
            {dataLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="text-[#00FFA3] animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="border border-white/10 p-12 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  No users
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="border border-white/10 p-5 bg-black"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono text-white/70">
                            {u.wallet.slice(0, 16)}...
                          </span>
                          <Badge value={u.role} />
                        </div>
                        <p className="text-[10px] text-white/40">
                          {u.email ?? "No email"}
                          {" · "}
                          {u.policyCount} policies{" · "}
                          {u.claimCount} claims{" · "}
                          {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          try {
                            const updated = await adminApi.setUserRole(
                              u.id,
                              e.target.value,
                            );
                            setUsers((prev) =>
                              prev.map((x) =>
                                x.id === updated.id ? updated : x,
                              ),
                            );
                          } catch (err) {
                            alert((err as Error).message);
                          }
                        }}
                        className="bg-black border border-white/20 text-[10px] text-white/70 px-2 py-1 uppercase font-mono outline-none focus:border-[#00FFA3] cursor-pointer"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Chain Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {tab === "chain" && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              On-chain program &amp; wallet status
            </p>
            {dataLoading || !chainStatus ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="text-[#00FFA3] animate-spin" />
              </div>
            ) : (
              <div className="space-y-px">
                {[
                  {
                    label: "Oracle Wallet",
                    value: chainStatus.oracleWallet,
                    link: `https://explorer.solana.com/address/${chainStatus.oracleWallet}?cluster=${chainStatus.cluster}`,
                  },
                  {
                    label: "Oracle SOL Balance",
                    value: `${chainStatus.oracleSolBalance.toFixed(6)} SOL`,
                  },
                  {
                    label: "Treasury PDA",
                    value: chainStatus.treasuryPda,
                    link: `https://explorer.solana.com/address/${chainStatus.treasuryPda}?cluster=${chainStatus.cluster}`,
                  },
                  {
                    label: "Treasury USDC Balance",
                    value: `$${chainStatus.treasuryUsdcBalance.toFixed(2)} USDC`,
                  },
                  {
                    label: "Program ID",
                    value: chainStatus.programId,
                    link: `https://explorer.solana.com/address/${chainStatus.programId}?cluster=${chainStatus.cluster}`,
                  },
                  {
                    label: "Network / Cluster",
                    value: chainStatus.cluster.toUpperCase(),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="border border-white/10 p-5 bg-black flex items-center justify-between"
                  >
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">
                      {row.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-white/80 break-all text-right">
                        {row.value}
                      </p>
                      {row.link && (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white/30 hover:text-[#00FFA3] flex-shrink-0"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Activity Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {tab === "activity" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-white/40 uppercase tracking-widest">
                Protocol audit trail
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30 uppercase">
                  Filter prefix:
                </span>
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="bg-black border border-white/20 text-xs text-white/70 px-3 py-1.5 font-mono outline-none focus:border-[#00FFA3]"
                >
                  <option value="">All</option>
                  <option value="claim">Claims</option>
                  <option value="policy">Policies</option>
                  <option value="user">Users</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {activity.length === 0 ? (
              <div className="border border-white/10 p-12 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  No activity yet
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {activity.map((a) => (
                  <div
                    key={a.id}
                    className="border border-white/10 p-4 bg-black flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] border px-1.5 py-0.5 uppercase tracking-widest ${a.actorRole === "admin" ? "border-purple-400 text-purple-400" : "border-white/20 text-white/40"}`}
                        >
                          {a.actorRole}
                        </span>
                        <span className="text-xs font-mono text-[#00FFA3]">
                          {a.action}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-white/40 mb-0.5 break-all">
                        {a.actor.slice(0, 20)}...
                      </p>
                      {a.targetId && (
                        <p className="text-[10px] text-white/30">
                          {a.targetType}: {a.targetId.slice(0, 12)}...
                        </p>
                      )}
                      {a.metadata && (
                        <p className="text-[10px] text-white/20 mt-0.5 font-mono truncate">
                          {JSON.stringify(a.metadata)}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 flex-shrink-0 text-right">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
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
