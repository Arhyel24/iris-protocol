import Link from "next/link";
import { ArrowRight, Shield, Zap, Lock, Globe } from "lucide-react";

const STATS = [
  { label: "Policies Active", value: "1,247" },
  { label: "Claims Paid", value: "$483K" },
  { label: "Avg Payout Time", value: "< 2 min" },
  { label: "Uptime", value: "99.97%" },
];

const FEATURES = [
  {
    icon: Shield,
    tag: "[ COVERAGE ]",
    title: "Real-World Insurance",
    desc: "Backed by licensed insurance APIs. Flight, gadget, travel — all products verified by regulated carriers.",
  },
  {
    icon: Zap,
    tag: "[ SETTLEMENT ]",
    title: "Instant On-Chain Payout",
    desc: "When a claim is approved, the escrow PDA releases funds to your wallet automatically. No waiting, no paperwork.",
  },
  {
    icon: Lock,
    tag: "[ SECURITY ]",
    title: "Non-Custodial Escrow",
    desc: "Your premium is locked in a Solana PDA — not held by us. Only released on verified claim approval.",
  },
  {
    icon: Globe,
    tag: "[ OPEN ]",
    title: "API-Agnostic Bridge",
    desc: "IRIS connects to any insurance provider via standard APIs. Qover, Boost, and more under one interface.",
  },
];

const HOW = [
  {
    step: "01",
    title: "Connect Wallet",
    desc: "Link your Phantom or Solflare wallet. No account needed.",
  },
  {
    step: "02",
    title: "Choose Coverage",
    desc: "Select a product type and coverage amount. Get an instant quote.",
  },
  {
    step: "03",
    title: "Pay in USDC",
    desc: "Pay the premium on-chain. Funds lock in a Solana escrow PDA.",
  },
  {
    step: "04",
    title: "File & Receive",
    desc: "Submit a claim. Once approved, the payout hits your wallet automatically.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-black text-white font-mono">
      {/* subtle grid */}
      <div
        className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #00FFA3 1px, transparent 1px), linear-gradient(to bottom, #00FFA3 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Hero */}
      <section className="relative z-10 border-b border-white/10 pt-28 pb-36 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-8 px-4 py-1 border border-[#00FFA3] bg-[#00FFA3]/10 text-[#00FFA3] text-xs uppercase tracking-widest">
            [ DEVNET BETA — LIVE NOW ]
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Bridge{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#0088FF]">
              Fiat
            </span>
            <br />
            With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0088FF] to-[#00FFA3]">
              Solana.
            </span>
          </h1>
          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto border-l-2 border-[#00FFA3] pl-4 text-left">
            IRIS is the settlement layer for Real-World Insurance APIs. Pay your
            premiums on-chain. Receive payouts securely via Escrow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/insurance"
              className="inline-flex items-center gap-2 bg-[#00FFA3] hover:bg-white text-black font-bold text-sm px-8 py-4 uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,255,163,0.4)]"
            >
              Get Covered <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-[#00FFA3] text-white/70 hover:text-[#00FFA3] text-sm px-8 py-4 uppercase tracking-widest transition-all"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-b border-white/10 bg-[#00FFA3]/[0.04]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-[#00FFA3]">{s.value}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-b border-white/10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ Features ]
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-16">
            Built for the{" "}
            <span className="text-[#00FFA3]">Next Generation</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-black p-8 hover:bg-white/[0.02] transition-colors"
              >
                <p className="text-xs text-[#00FFA3] mb-4">{f.tag}</p>
                <div className="flex items-start gap-4">
                  <f.icon
                    size={20}
                    className="text-[#00FFA3] mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-b border-white/10 py-24 px-4 bg-[#00FFA3]/[0.02]">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ How It Works ]
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-16">
            Four Steps. <span className="text-[#00FFA3]">Full Coverage.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/10">
            {HOW.map((h) => (
              <div key={h.step} className="bg-black p-8">
                <p className="text-5xl font-black text-white/10 mb-4">
                  {h.step}
                </p>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-[#00FFA3]">
                  {h.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center border border-white/10 p-12">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-6">
            [ Get Started ]
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">
            Ready to go <span className="text-[#00FFA3]">On-Chain?</span>
          </h2>
          <p className="text-sm text-white/50 mb-10 max-w-lg mx-auto">
            Connect your wallet and get your first insurance quote in under 60
            seconds.
          </p>
          <Link
            href="/insurance"
            className="inline-flex items-center gap-2 bg-[#00FFA3] hover:bg-white text-black font-bold text-sm px-10 py-4 uppercase tracking-widest transition-all"
          >
            Buy Insurance Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
