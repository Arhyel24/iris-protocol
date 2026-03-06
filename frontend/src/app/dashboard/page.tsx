"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowRight,
  Shield,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  Loader2,
} from "lucide-react";
import { useEmailGuard } from "@/hooks/use-email-guard";
import { api, type Policy, type Claim } from "@/lib/api";

const statusColor: Record<string, string> = {
  active: "text-[#00FFA3] border-[#00FFA3]",
  expired: "text-white/40 border-white/20",
  pending: "text-yellow-400 border-yellow-400",
  paid: "text-[#00FFA3] border-[#00FFA3]",
  rejected: "text-red-400 border-red-400",
};

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const guardState = useEmailGuard();
  const router = useRouter();
  const pathname = usePathname();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Redirect to /setup if wallet connected but no email
  useEffect(() => {
    if (guardState === "needs-email") {
      router.push(`/setup?from=${encodeURIComponent(pathname)}`);
    }
  }, [guardState, router, pathname]);

  useEffect(() => {
    if (guardState !== "ok") return;
    setDataLoading(true);
    Promise.all([api.myPolicies(), api.myClaims()])
      .then(([p, c]) => {
        setPolicies(p);
        setClaims(c);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [guardState]);

  const activePolicies = policies.filter((p) => p.status === "active");
  const totalCoverage = activePolicies.reduce(
    (s, p) => s + p.coverageAmount,
    0,
  );
  const paidClaims = claims.filter((c) => c.status === "paid");
  const pendingClaims = claims.filter((c) => c.status === "pending").length;

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 font-mono">
        <div className="border border-white/10 p-12 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-[#00FFA3]/10 border border-[#00FFA3] flex items-center justify-center mx-auto mb-6">
            <Shield size={20} className="text-[#00FFA3]" />
          </div>
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ AUTH REQUIRED ]
          </p>
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-xs text-white/50 mb-8 leading-relaxed">
            Connect a Solana wallet to view your policies, claims, and coverage
            stats.
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

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}`
    : "";

  const STATS = [
    {
      icon: Shield,
      label: "Active Policies",
      value: String(activePolicies.length),
      color: "#00FFA3",
    },
    {
      icon: FileText,
      label: "Claims Filed",
      value: String(claims.length),
      color: "#ffffff",
    },
    {
      icon: CheckCircle,
      label: "Claims Paid",
      value: String(paidClaims.length),
      color: "#00FFA3",
    },
    {
      icon: TrendingUp,
      label: "Total Coverage",
      value: totalCoverage > 0 ? `$${totalCoverage.toLocaleString()}` : "—",
      color: "#0088FF",
    },
  ];

  const recentPolicies = policies.slice(0, 3);
  const recentClaims = claims.slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header bar */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest">
              [ DASHBOARD ]
            </p>
            <p className="text-sm font-bold mt-0.5">
              Wallet: <span className="text-[#00FFA3]">{shortKey}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-xs text-white/40 uppercase tracking-widest">
              DEVNET
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="bg-black p-6">
              <s.icon size={16} style={{ color: s.color }} className="mb-3" />
              <p className="text-xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Activity indicator */}
        <div className="border border-white/10 p-4 mb-8 flex items-center gap-3">
          <Activity size={14} className="text-[#00FFA3]" />
          <p className="text-xs text-white/50 uppercase tracking-widest">
            System Status: All Insurance APIs Operational
          </p>
          <span className="ml-auto text-xs text-[#00FFA3]">[ OK ]</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Policies */}
          <div className="border border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <p className="text-xs uppercase tracking-widest text-[#00FFA3]">
                [ Active Policies ]
              </p>
              <Link
                href="/insurance"
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                New policy <ArrowRight size={10} />
              </Link>
            </div>
            <div className="divide-y divide-white/10">
              {dataLoading ? (
                <div className="px-6 py-8 text-center">
                  <Loader2
                    size={14}
                    className="text-[#00FFA3] animate-spin mx-auto"
                  />
                </div>
              ) : recentPolicies.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-xs text-white/30 uppercase tracking-widest">
                    No policies yet
                  </p>
                </div>
              ) : (
                recentPolicies.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between px-6 py-4 hover:bg-white/[0.02]"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase">
                        {p.productType} Insurance
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {p.id.slice(0, 8)} · Expires{" "}
                        {new Date(p.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#00FFA3]">
                        ${p.coverageAmount.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] border px-1.5 py-0.5 uppercase tracking-widest mt-1 inline-block ${statusColor[p.status] ?? ""}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-3 border-t border-white/10">
              <Link
                href="/history"
                className="text-xs text-white/40 hover:text-[#00FFA3] flex items-center gap-1"
              >
                View all <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* Recent Claims */}
          <div className="border border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <p className="text-xs uppercase tracking-widest text-[#00FFA3]">
                [ Recent Claims ]
              </p>
              <Link
                href="/claims"
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                File claim <ArrowRight size={10} />
              </Link>
            </div>
            {dataLoading ? (
              <div className="px-6 py-8 text-center">
                <Loader2
                  size={14}
                  className="text-[#00FFA3] animate-spin mx-auto"
                />
              </div>
            ) : recentClaims.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  No claims filed
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentClaims.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between px-6 py-4 hover:bg-white/[0.02]"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase">
                        {c.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Policy {c.policyId.slice(0, 8)} ·{" "}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">
                        {c.payoutAmount
                          ? `$${c.payoutAmount.toLocaleString()}`
                          : "—"}
                      </p>
                      <span
                        className={`text-[10px] border px-1.5 py-0.5 uppercase tracking-widest mt-1 inline-block ${statusColor[c.status] ?? ""}`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="px-6 py-3 border-t border-white/10">
              <Link
                href="/claims"
                className="text-xs text-white/40 hover:text-[#00FFA3] flex items-center gap-1"
              >
                View all claims <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10">
          {[
            {
              label: "Buy Insurance",
              desc: "Get a new policy",
              href: "/insurance",
              icon: Shield,
            },
            {
              label: "File a Claim",
              desc: "Submit against active policy",
              href: "/claims",
              icon: FileText,
            },
            {
              label: "View History",
              desc: "All policies & payouts",
              href: "/history",
              icon: Clock,
            },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="bg-black hover:bg-[#00FFA3]/[0.05] transition-colors p-6 flex items-center gap-4"
            >
              <a.icon size={18} className="text-[#00FFA3] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">
                  {a.label}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight size={12} className="ml-auto text-white/20" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
