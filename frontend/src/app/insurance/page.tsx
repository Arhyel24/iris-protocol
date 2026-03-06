"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useEmailGuard } from "@/hooks/use-email-guard";
import { api, type Quote } from "@/lib/api";
import { purchasePolicy } from "@/lib/anchor-client";

const PRODUCTS = [
  {
    id: "flight",
    label: "Flight Insurance",
    desc: "Delays, cancellations, missed connections.",
    rate: 0.02,
    icon: "✈️",
  },
  {
    id: "gadget",
    label: "Gadget Insurance",
    desc: "Accidental damage, theft, breakdown.",
    rate: 0.03,
    icon: "💻",
  },
  {
    id: "travel",
    label: "Travel Insurance",
    desc: "Medical emergencies, trip interruption, lost baggage.",
    rate: 0.015,
    icon: "🌍",
  },
];

const DURATION_MONTHS = 12;

type Step = "select" | "quote" | "pay" | "done";

export default function InsurancePage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const guardState = useEmailGuard();

  const [step, setStep] = useState<Step>("select");
  const [product, setProduct] = useState<string>("flight");
  const [coverage, setCoverage] = useState<number>(5000);

  // API state
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // On-chain purchase state
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseTx, setPurchaseTx] = useState<string | null>(null);
  // Stored so we can retry backend registration without re-doing the on-chain tx
  const [purchaseResult, setPurchaseResult] = useState<{
    txHash: string;
    policyPda: string;
    monthlyPremium: number;
  } | null>(null);

  const selected = PRODUCTS.find((p) => p.id === product)!;
  const premium = Math.round(coverage * selected.rate * 100) / 100;

  // --- Step 1 → 2: fetch quote from backend ---
  const handleGetQuote = useCallback(async () => {
    setQuoteError(null);
    setQuoteLoading(true);
    try {
      const q = await api.requestQuote({
        productType: product,
        coverageAmount: coverage,
        currency: "USDC",
      });
      setQuote(q);
      setStep("quote");
    } catch (e) {
      setQuoteError((e as Error).message ?? "Failed to get quote.");
    } finally {
      setQuoteLoading(false);
    }
  }, [product, coverage]);

  const handlePay = () => {
    setPurchaseError(null);
    setStep("pay");
  };

  // --- Step 3 → 4: purchase policy on-chain then notify backend ---
  const handleConfirm = useCallback(async () => {
    if (!quote || !publicKey) return;
    setPurchaseLoading(true);
    setPurchaseError(null);

    try {
      const adminPubkey = new PublicKey(
        process.env.NEXT_PUBLIC_ADMIN_PUBKEY ??
          "11111111111111111111111111111111", // placeholder — override in .env.local
      );

      // Monthly premium in USDC micro-units (6 decimals)
      const monthlyPremiumLamports = BigInt(
        Math.round((quote.premiumAmount / DURATION_MONTHS) * 1_000_000),
      );

      const result = await purchasePolicy({
        userPubkey: publicKey,
        adminPubkey,
        quoteId: quote.id,
        monthlyPremiumLamports,
        durationMonths: DURATION_MONTHS,
        connection,
        sendTransaction,
      });

      // On-chain succeeded — store result so we can retry backend without re-buying
      const monthlyPremiumUsdc = Number(monthlyPremiumLamports) / 1_000_000;
      setPurchaseTx(result.txHash);
      setPurchaseResult({
        txHash: result.txHash,
        policyPda: result.policyPda,
        monthlyPremium: monthlyPremiumUsdc,
      });

      // Notify backend to activate the policy record
      await api.createPolicy({
        quoteId: quote.id,
        premiumTxHash: result.txHash,
        escrowAccount: result.policyPda,
        monthlyPremium: monthlyPremiumUsdc,
        durationMonths: DURATION_MONTHS,
      });

      setStep("done");
    } catch (e) {
      const msg = (e as Error).message ?? "Transaction failed.";
      setPurchaseError(msg);
    } finally {
      setPurchaseLoading(false);
    }
  }, [quote, publicKey, connection, sendTransaction]);

  // Retry backend registration after on-chain tx already succeeded
  const handleRetryBackend = useCallback(async () => {
    if (!quote || !purchaseResult) return;
    setPurchaseLoading(true);
    setPurchaseError(null);
    try {
      await api.createPolicy({
        quoteId: quote.id,
        premiumTxHash: purchaseResult.txHash,
        escrowAccount: purchaseResult.policyPda,
        monthlyPremium: purchaseResult.monthlyPremium,
        durationMonths: DURATION_MONTHS,
      });
      setStep("done");
    } catch (e) {
      setPurchaseError((e as Error).message ?? "Backend registration failed.");
    } finally {
      setPurchaseLoading(false);
    }
  }, [quote, purchaseResult]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 font-mono">
        <div className="border border-white/10 p-12 max-w-md w-full text-center">
          <Shield size={24} className="text-[#00FFA3] mx-auto mb-6" />
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ WALLET REQUIRED ]
          </p>
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">
            Connect to Get Covered
          </h2>
          <p className="text-xs text-white/50 mb-8">
            Link your Solana wallet to buy insurance on-chain.
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
      {/* Page header */}
      <div className="border-b border-white/10 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-1">
            [ Insurance ]
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Buy Coverage
          </h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="border-b border-white/10 px-4">
        <div className="max-w-3xl mx-auto flex">
          {(["select", "quote", "pay", "done"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`flex-1 text-center py-3 text-[10px] uppercase tracking-widest border-b-2 transition-colors ${
                step === s
                  ? "border-[#00FFA3] text-[#00FFA3]"
                  : "border-transparent text-white/30"
              }`}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Step 1: Select product */}
        {step === "select" && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              Select a product
            </p>
            <div className="space-y-px">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProduct(p.id)}
                  className={`w-full text-left p-6 border transition-colors flex items-start gap-4 ${
                    product === p.id
                      ? "border-[#00FFA3] bg-[#00FFA3]/[0.06]"
                      : "border-white/10 hover:border-white/30 bg-black"
                  }`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold uppercase tracking-wide">
                      {p.label}
                    </p>
                    <p className="text-xs text-white/50 mt-1">{p.desc}</p>
                    <p className="text-xs text-[#00FFA3] mt-2">
                      Rate: {(p.rate * 100).toFixed(1)}% of coverage
                    </p>
                  </div>
                  {product === p.id && (
                    <CheckCircle
                      size={16}
                      className="text-[#00FFA3] mt-1 flex-shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 border border-white/10 p-6">
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-3">
                Coverage Amount (USDC)
              </label>
              <input
                type="number"
                value={coverage}
                onChange={(e) => setCoverage(Number(e.target.value))}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#00FFA3] transition-colors"
                min={100}
                max={100000}
                step={100}
              />
              <p className="text-xs text-white/30 mt-2">
                Min $100 · Max $100,000 USDC
              </p>
            </div>

            {quoteError && (
              <div className="mt-4 border border-red-500/30 bg-red-500/[0.06] p-4 flex items-start gap-3">
                <AlertTriangle
                  size={14}
                  className="text-red-400 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-red-400">{quoteError}</p>
              </div>
            )}

            <button
              onClick={handleGetQuote}
              disabled={quoteLoading}
              className="mt-6 w-full bg-[#00FFA3] hover:bg-white disabled:opacity-50 text-black font-bold text-sm py-4 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {quoteLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Getting
                  Quote...
                </>
              ) : (
                <>
                  Get Quote <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Quote */}
        {step === "quote" && quote && (
          <div>
            <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-6">
              [ Quote Generated ]
            </p>
            <div className="border border-[#00FFA3]/30 bg-[#00FFA3]/[0.04] p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Product
                  </p>
                  <p className="text-lg font-bold mt-1">{selected.label}</p>
                </div>
                <span className="text-xs border border-[#00FFA3] text-[#00FFA3] px-2 py-1 uppercase tracking-widest">
                  QUOTE VALID 24H
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Coverage
                  </p>
                  <p className="text-xl font-black text-white mt-1">
                    ${quote.coverageAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Annual Premium
                  </p>
                  <p className="text-xl font-black text-[#00FFA3] mt-1">
                    {quote.premiumAmount} USDC
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Monthly Payment
                  </p>
                  <p className="text-sm font-bold mt-1 text-[#00FFA3]">
                    {(quote.premiumAmount / DURATION_MONTHS).toFixed(2)} USDC
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Duration
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {DURATION_MONTHS} months
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Quote ID
                  </p>
                  <p className="text-xs font-mono mt-1 text-white/60 truncate">
                    {quote.id}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 leading-relaxed">
                  First month paid upfront on-chain. Remaining{" "}
                  {DURATION_MONTHS - 1} monthly payments auto-collected by the
                  oracle from your approved USDC allowance. Policy expires
                  automatically after {DURATION_MONTHS} months.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep("select")}
                className="flex-1 border border-white/20 hover:border-white/50 text-white/60 hover:text-white text-sm py-4 uppercase tracking-widest transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePay}
                className="flex-1 bg-[#00FFA3] hover:bg-white text-black font-bold text-sm py-4 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                Pay {(quote.premiumAmount / DURATION_MONTHS).toFixed(2)} USDC{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pay */}
        {step === "pay" && quote && (
          <div className="text-center">
            <div className="border border-white/10 p-10 mb-6">
              <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-4">
                [ Payment ]
              </p>
              <p className="text-3xl font-black mb-2">
                {(quote.premiumAmount / DURATION_MONTHS).toFixed(2)}{" "}
                <span className="text-[#00FFA3]">USDC</span>
              </p>
              <p className="text-xs text-white/40 uppercase tracking-widest">
                first month locked in Solana escrow PDA
              </p>
              <div className="mt-8 bg-[#00FFA3]/[0.04] border border-white/10 p-4 text-left">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                  Transaction Details
                </p>
                <div className="space-y-1 text-xs text-white/40">
                  <div className="flex justify-between">
                    <span>Network</span>
                    <span className="text-white/60">Solana Devnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token</span>
                    <span className="text-white/60">USDC (SPL)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Program</span>
                    <span className="text-white/60">IRIS v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowance Approved</span>
                    <span className="text-white/60">
                      {(
                        (quote.premiumAmount / DURATION_MONTHS) *
                        (DURATION_MONTHS - 1)
                      ).toFixed(2)}{" "}
                      USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Gas</span>
                    <span className="text-white/60">~0.000005 SOL</span>
                  </div>
                </div>
              </div>
            </div>

            {purchaseError && (
              <div className="mb-4 border border-red-500/30 bg-red-500/[0.06] p-4 flex flex-col gap-3 text-left">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={14}
                    className="text-red-400 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-red-400">{purchaseError}</p>
                </div>
                {/* On-chain tx already confirmed — only backend registration failed */}
                {purchaseTx && (
                  <div className="flex flex-col gap-2 pl-5">
                    <p className="text-xs text-yellow-400/80">
                      Your on-chain transaction was confirmed. Only the backend
                      registration failed — retry below to activate your policy.
                    </p>
                    <a
                      href={`https://explorer.solana.com/tx/${purchaseTx}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#00FFA3] underline underline-offset-2 font-mono"
                    >
                      View tx: {purchaseTx.slice(0, 20)}...
                    </a>
                    <button
                      onClick={handleRetryBackend}
                      disabled={purchaseLoading}
                      className="self-start border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 text-xs px-4 py-2 uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      {purchaseLoading
                        ? "Retrying..."
                        : "[ Retry Registration ]"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={purchaseLoading}
              className="w-full bg-[#00FFA3] hover:bg-white disabled:opacity-50 text-black font-bold text-sm py-4 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {purchaseLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Sending
                  Transaction...
                </>
              ) : (
                "[ Confirm Transaction in Wallet ]"
              )}
            </button>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#00FFA3]/10 border border-[#00FFA3] flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-[#00FFA3]" />
            </div>
            <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
              [ POLICY ACTIVE ]
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
              You&apos;re Covered!
            </h2>
            <p className="text-sm text-white/50 max-w-sm mx-auto mb-4">
              Your {selected.label.toLowerCase()} policy is now active. First
              month locked in escrow. Remaining {DURATION_MONTHS - 1} months
              will be auto-collected monthly.
            </p>
            {purchaseTx && (
              <a
                href={`https://explorer.solana.com/tx/${purchaseTx}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-[#00FFA3] underline underline-offset-2 mb-8 font-mono"
              >
                View tx: {purchaseTx.slice(0, 20)}...
              </a>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/dashboard"
                className="border border-white/20 hover:border-[#00FFA3] text-white/60 hover:text-[#00FFA3] text-sm px-8 py-3 uppercase tracking-widest transition-colors"
              >
                Go to Dashboard
              </a>
              <button
                onClick={() => {
                  setStep("select");
                  setQuote(null);
                  setPurchaseTx(null);
                }}
                className="bg-[#00FFA3] hover:bg-white text-black font-bold text-sm px-8 py-3 uppercase tracking-widest transition-colors"
              >
                Buy Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
