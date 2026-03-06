import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Beta Disclaimer",
    content:
      "IRIS Protocol is in public beta on Solana Devnet. The platform is provided AS IS with no warranty. Features, fees, and coverage terms may change without notice. Do not use IRIS with funds you cannot afford to lose.",
  },
  {
    title: "2. Eligibility",
    content:
      "You must be at least 18 years old and not located in a jurisdiction where purchasing insurance or using blockchain-based financial services is prohibited. By using IRIS, you confirm that you meet these requirements.",
  },
  {
    title: "3. Coverage Terms",
    content:
      "Insurance coverage is provided by licensed third-party carriers integrated via API. Coverage terms, exclusions, and limits are set by those carriers and are disclosed in full before you complete a purchase. IRIS is a settlement layer — it is not itself an insurance company.",
  },
  {
    title: "4. Premiums & Escrow",
    content:
      "When you purchase a policy, your premium (in USDC) is locked in a non-custodial Solana PDA. IRIS cannot unilaterally access or move these funds. The escrow is released only upon validated claim approval or policy cancellation per the on-chain program logic.",
  },
  {
    title: "5. Claims",
    content:
      "Claims are validated by the relevant insurance provider API. IRIS relays the provider determination on-chain and executes the payout automatically. IRIS does not adjudicate claims independently and cannot override a provider decision.",
  },
  {
    title: "6. No Financial Advice",
    content:
      "Nothing on the IRIS platform constitutes financial, investment, or legal advice. Coverage amounts and products are illustrative. Consult a licensed professional before making financial decisions.",
  },
  {
    title: "7. Protocol Risk",
    content:
      "You acknowledge inherent risks of blockchain technology including smart contract bugs, network outages, oracle failures, and regulatory changes. These risks may result in partial or total loss of funds.",
  },
  {
    title: "8. Governing Law",
    content:
      "These terms are governed by the laws of the jurisdiction in which IRIS Labs is incorporated, without regard to conflict of law provisions. Any disputes shall be resolved through binding arbitration.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We may update these Terms. Changes will be posted with a revised effective date. Continued use of IRIS after changes constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="border-b border-white/10 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ LEGAL ]
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Terms of <span className="text-[#00FFA3]">Service</span>
          </h1>
          <p className="text-white/40 text-xs mt-4">
            Effective: January 1, 2026
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <p className="text-sm text-white/60 leading-relaxed">
          By connecting your wallet and using IRIS Protocol, you agree to these
          Terms of Service. Please read them carefully. If you do not agree, do
          not use the platform.
        </p>

        {SECTIONS.map((s, i) => (
          <div key={i} className="border-l-2 border-white/10 pl-6">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-2">
              {s.title}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">{s.content}</p>
          </div>
        ))}

        <div className="pt-4 flex gap-6 text-xs text-white/30">
          <Link
            href="/privacy"
            className="hover:text-[#00FFA3] transition-colors uppercase tracking-widest"
          >
            Privacy Policy
          </Link>
          <Link
            href="/support"
            className="hover:text-[#00FFA3] transition-colors uppercase tracking-widest"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
