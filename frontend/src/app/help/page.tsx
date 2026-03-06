import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    label: "Getting Started",
    color: "#00FFA3",
    articles: [
      { title: "What is IRIS Protocol?", href: "/faq#what-is-iris" },
      { title: "How to connect your wallet", href: "/faq#wallets" },
      { title: "Devnet vs Mainnet — what to know", href: "/faq#mainnet" },
      { title: "Getting devnet USDC for testing", href: "/faq#usdc" },
    ],
  },
  {
    label: "wallet Issues",
    color: "#0088FF",
    articles: [
      {
        title: "Wallet won't connect — troubleshooting steps",
        href: "/faq#wallets",
      },
      { title: "Switching between Phantom and Solflare", href: "/faq#wallets" },
      {
        title: "Wrong network selected (must be Devnet)",
        href: "/faq#mainnet",
      },
      { title: "Transaction rejected — common causes", href: "/support" },
    ],
  },
  {
    label: "Insurance Products",
    color: "#00FFA3",
    articles: [
      { title: "What products are available?", href: "/faq#products" },
      { title: "How is my premium calculated?", href: "/faq#premium" },
      { title: "Where are my funds held?", href: "/faq#escrow" },
      { title: "Can I cancel a policy?", href: "/faq#cancel" },
    ],
  },
  {
    label: "Claims & Payouts",
    color: "#0088FF",
    articles: [
      { title: "How to file a claim", href: "/claims" },
      { title: "How long does claim review take?", href: "/faq#payout" },
      { title: "Claim was denied — what next?", href: "/support" },
      { title: "Where does my payout go?", href: "/faq#payout" },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="border-b border-white/10 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ HELP CENTER ]
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            How Can We <span className="text-[#00FFA3]">Help?</span>
          </h1>
          <p className="text-sm text-white/40 max-w-xl">
            Browse articles below or open a support ticket if you need direct
            assistance.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-12 border border-white/10">
          <Link
            href="/faq"
            className="p-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
          >
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
              Browse
            </p>
            <p className="text-sm font-bold group-hover:text-[#00FFA3] transition-colors flex items-center gap-2">
              Full FAQ <ArrowRight size={10} />
            </p>
          </Link>
          <Link
            href="/support"
            className="p-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
          >
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
              Contact
            </p>
            <p className="text-sm font-bold group-hover:text-[#00FFA3] transition-colors flex items-center gap-2">
              Open Ticket <ArrowRight size={10} />
            </p>
          </Link>
          <Link
            href="/insurance"
            className="p-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
          >
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
              Product
            </p>
            <p className="text-sm font-bold group-hover:text-[#00FFA3] transition-colors flex items-center gap-2">
              Buy Insurance <ArrowRight size={10} />
            </p>
          </Link>
          <Link
            href="/claims"
            className="p-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
          >
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
              Claims
            </p>
            <p className="text-sm font-bold group-hover:text-[#00FFA3] transition-colors flex items-center gap-2">
              File a Claim <ArrowRight size={10} />
            </p>
          </Link>
        </div>

        {/* Article categories */}
        <div className="grid md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="border border-white/10 p-6">
              <p
                className="text-xs uppercase tracking-widest mb-4 font-bold"
                style={{ color: cat.color }}
              >
                [ {cat.label} ]
              </p>
              <ul className="space-y-3">
                {cat.articles.map((a, j) => (
                  <li key={j}>
                    <Link
                      href={a.href}
                      className="flex items-center justify-between text-sm text-white/60 hover:text-white transition-colors group"
                    >
                      <span>{a.title}</span>
                      <ArrowRight
                        size={10}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Escalation */}
        <div className="mt-12 border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
              [ Need more help? ]
            </p>
            <p className="text-sm font-bold">
              Our team responds within 24 hours on business days.
            </p>
          </div>
          <Link
            href="/support"
            className="flex-shrink-0 bg-[#00FFA3] text-black text-xs px-6 py-3 uppercase tracking-widest font-bold hover:bg-white transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
