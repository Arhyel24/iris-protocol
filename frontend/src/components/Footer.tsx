import Link from "next/link";

const LINKS = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Buy Insurance", href: "/insurance" },
    { label: "File a Claim", href: "/claims" },
    { label: "History", href: "/history" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "FAQ", href: "/faq" },
    { label: "Customer Care", href: "/support" },
    { label: "About IRIS", href: "/about" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-black border-t border-white/10 font-mono">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-[#00FFA3] border border-[#00FFA3] relative flex-shrink-0">
                <div className="absolute inset-[3px] bg-black" />
              </div>
              <span className="text-base font-black text-white tracking-widest uppercase">
                IRIS
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed max-w-[12rem]">
              Settlement layer for Real-World Insurance APIs on Solana.
            </p>
            <div className="mt-6 inline-block text-xs text-white/30 border border-white/10 px-2 py-1 uppercase tracking-widest">
              DEVNET BETA
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-4">
                [ {section} ]
              </p>
              <ul className="space-y-3">
                {(links as { label: string; href: string }[]).map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-xs text-white/50 hover:text-[#00FFA3] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} IRIS Labs. All rights reserved.
          </p>
          <p className="text-xs text-white/20 uppercase tracking-widest">
            Built on Solana &mdash; Powered by Real Insurance APIs
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
