"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Insurance", href: "/insurance" },
  { label: "Claims", href: "/claims" },
  { label: "History", href: "/history" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#00FFA3] border border-[#00FFA3] relative flex-shrink-0">
            <div className="absolute inset-[3px] bg-black" />
          </div>
          <span className="font-mono text-base font-black text-white tracking-widest uppercase">
            IRIS
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                isActive(l.href)
                  ? "text-[#00FFA3]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {isActive(l.href) ? `[ ${l.label} ]` : l.label}
            </Link>
          ))}
        </div>

        {/* Wallet */}
        <div className="hidden md:flex items-center">
          <WalletMultiButton />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/60 hover:text-white p-1"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`font-mono text-sm uppercase tracking-widest py-2 border-b border-white/10 ${
                isActive(l.href) ? "text-[#00FFA3]" : "text-white/60"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2">
            <WalletMultiButton />
          </div>
        </div>
      )}
    </nav>
  );
}
