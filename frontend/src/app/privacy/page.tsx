import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content:
      "IRIS interacts exclusively with publicly available on-chain data: your Solana wallet address, transaction history on the Solana blockchain, and policy/claim state stored in our Solana program. We do not collect names, email addresses, IP addresses, or any off-chain personally identifiable information.",
  },
  {
    title: "2. Wallet Addresses",
    content:
      "Your wallet public key is used to identify your account, display your policies, and sign on-chain transactions. It is a public key by nature and is visible on the Solana blockchain. We do not link your wallet to any off-chain identity.",
  },
  {
    title: "3. On-Chain Data",
    content:
      "All policy purchases, premium payments, claims, and payouts are recorded immutably on the Solana blockchain. This data is public by design and cannot be erased. IRIS reads this data to display your dashboard and policy history.",
  },
  {
    title: "4. Insurance Provider Data",
    content:
      "To process claims, IRIS relays claim details (event date, policy ID, description) to third-party insurance provider APIs (e.g. Qover, Boost Insurance). These providers operate under their own privacy policies and may be regulated insurers.",
  },
  {
    title: "5. Cookies & Analytics",
    content:
      "The IRIS frontend does not use tracking cookies, browser fingerprinting, or third-party analytics scripts. We do not build behavioral profiles of users.",
  },
  {
    title: "6. Data Retention",
    content:
      "Off-chain data processed by the IRIS backend (e.g. quote requests) is retained for 90 days and then deleted. On-chain data persists on the Solana blockchain permanently per the nature of the protocol.",
  },
  {
    title: "7. Your Rights",
    content:
      "You may request deletion of any off-chain data we hold by contacting support. On-chain data is immutable and cannot be deleted. You can disconnect your wallet at any time to stop using the service.",
  },
  {
    title: "8. Changes to This Policy",
    content:
      "We may update this Privacy Policy. Changes will be posted at this URL with a revised effective date. Continued use of IRIS after changes constitutes acceptance.",
  },
  {
    title: "9. Contact",
    content:
      "For privacy-related questions, open a support ticket or reach out on our official community channels. We aim to respond within 48 hours.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="border-b border-white/10 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ LEGAL ]
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Privacy <span className="text-[#00FFA3]">Policy</span>
          </h1>
          <p className="text-white/40 text-xs mt-4">
            Effective: January 1, 2026
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <p className="text-sm text-white/60 leading-relaxed">
          IRIS Protocol is committed to transparency. This policy explains what
          data we collect, why, and how it is handled. IRIS is a non-custodial
          protocol — we never hold your private keys or assets.
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
            href="/terms"
            className="hover:text-[#00FFA3] transition-colors uppercase tracking-widest"
          >
            Terms of Service
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
