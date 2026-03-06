"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Mail } from "lucide-react";
import { useJwt } from "@/contexts/JwtContext";
import { api } from "@/lib/api";

export default function SetupPage() {
  const { connected, publicKey } = useWallet();
  const { user, setUser, isAuthenticated, isLoading } = useJwt();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // If user already has email, skip
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.email) {
      router.replace(from);
    }
  }, [isLoading, isAuthenticated, user?.email, from, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const updated = await api.patchUser(publicKey.toBase58(), {
        email: email.trim(),
      });
      setUser(updated);
      setStatus("success");
      setTimeout(() => router.push(from), 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const ready = connected && isAuthenticated;

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
          [ ACCOUNT SETUP ]
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
          One more step
        </h1>
        <p className="text-white/40 text-sm mb-10 leading-relaxed">
          Add an email address to receive claim updates and policy
          notifications.
        </p>

        {/* Step 1 â€” Wallet */}
        <div className="border border-white/10 p-5 mb-4">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-3">
            [ 01 ] Wallet
          </p>
          {connected && publicKey ? (
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-[#00FFA3]" />
              <span className="text-sm text-[#00FFA3]">
                {publicKey.toBase58().slice(0, 6)}â€¦
                {publicKey.toBase58().slice(-4)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white/50">Connect your wallet first</p>
              <WalletMultiButton />
            </div>
          )}
        </div>

        {/* Step 2 â€” Auth status */}
        {connected && !isAuthenticated && (
          <div className="border border-white/10 p-5 mb-4 flex items-center gap-3 text-white/50 text-sm">
            <Loader2 size={14} className="animate-spin text-[#00FFA3]" />
            Signing in with walletâ€¦
          </div>
        )}

        {/* Step 3 â€” Email */}
        {ready && (
          <div className="border border-white/10 p-5 mb-6">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-3">
              [ 02 ] Email Address
            </p>

            {status === "success" ? (
              <div className="flex items-center gap-3 text-[#00FFA3]">
                <CheckCircle size={16} />
                <span className="text-sm">Email saved â€” redirectingâ€¦</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3">
                  <Mail size={14} className="text-white/30 shrink-0" />
                  <input
                    type="email"
                    required
                    disabled={status === "submitting"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none font-mono"
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-400">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={!email || status === "submitting"}
                  className="w-full bg-[#00FFA3] text-black text-xs font-bold uppercase tracking-widest py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Savingâ€¦
                    </>
                  ) : (
                    "Save & Continue"
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-xs text-white/20 text-center">
          Your email is used only for claim and policy notifications.
        </p>
      </div>
    </div>
  );
}
