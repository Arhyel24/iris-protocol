import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STATS = [
  { label: "Blockchain", value: "Solana" },
  { label: "Network", value: "Devnet (Beta)" },
  { label: "Escrow Type", value: "Non-Custodial PDA" },
  { label: "Premium Currency", value: "USDC (SPL)" },
];

const STEPS = [
  {
    n: "01",
    title: "Connect Wallet",
    desc: "Link your Phantom or Solflare wallet on Solana Devnet.",
  },
  {
    n: "02",
    title: "Get a Quote",
    desc: "Select a product (Flight / Gadget / Travel), enter coverage amount, and receive an instant quote from our provider APIs.",
  },
  {
    n: "03",
    title: "Pay Premium On-Chain",
    desc: "Approve a USDC transfer into a Solana PDA. Funds are locked — only the on-chain program can release them.",
  },
  {
    n: "04",
    title: "File a Claim",
    desc: "Submit a claim with supporting details. Our system relays it to the insurance provider API for validation.",
  },
  {
    n: "05",
    title: "Receive Payout",
    desc: "On claim approval, the escrow PDA releases USDC directly to your wallet. No intermediaries. No delays.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Hero */}
      <div
        className="px-4 py-24 border-b border-white/10 relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,163,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,163,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-4">
            [ ABOUT IRIS ]
          </p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            Real-World Insurance.
            <br />
            <span className="text-[#00FFA3]">On-Chain Settlement.</span>
          </h1>
          <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
            IRIS is a settlement layer that connects real-world insurance APIs
            to Solana. Premiums are locked in non-custodial escrow PDAs. Claims
            are validated by licensed carriers and paid out automatically — no
            banks, no delays, no gatekeepers.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {STATS.map((s, i) => (
            <div key={i} className="px-6 py-8">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
                {s.label}
              </p>
              <p className="text-sm font-bold text-[#00FFA3]">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
          [ Protocol Flow ]
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-10">
          How IRIS Works
        </h2>
        <div className="space-y-px">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="border border-white/10 p-6 flex gap-6 hover:border-white/20 transition-colors"
            >
              <div className="text-2xl font-black text-[#00FFA3] opacity-40 flex-shrink-0 w-10">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide mb-1">
                  {step.title}
                </p>
                <p className="text-xs text-white/50 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
            [ Mission ]
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
            Why We Built IRIS
          </h2>
          <div className="grid md:grid-cols-2 gap-px border border-white/10">
            <div className="p-8 bg-white/[0.02]">
              <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
                The Problem
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                Traditional insurance is slow, opaque, and full of
                intermediaries. Claims take weeks. Payouts are delayed by manual
                review. There is no on-chain proof of coverage. Consumers cannot
                verify whether their premium is actually safe.
              </p>
            </div>
            <div className="p-8 bg-white/[0.02]">
              <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
                Our Solution
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                IRIS locks premiums in non-custodial Solana PDAs and connects
                validated claim decisions directly to escrow release. Every
                transaction is on-chain, provable, and instant. No trust
                required — only math and code.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
              [ Get Started ]
            </p>
            <p className="text-lg font-black uppercase tracking-tighter">
              Ready to use IRIS?
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/insurance"
              className="flex items-center gap-2 bg-[#00FFA3] text-black text-xs px-6 py-3 uppercase tracking-widest font-bold hover:bg-white transition-colors"
            >
              Buy Insurance <ArrowRight size={12} />
            </Link>
            <Link
              href="/faq"
              className="border border-white/20 text-white/60 text-xs px-6 py-3 uppercase tracking-widest hover:border-white/40 hover:text-white transition-colors"
            >
              Read FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
