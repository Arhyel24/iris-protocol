export const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-10 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo — matches header */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#00FFA3] border border-[#00FFA3] relative flex-shrink-0">
              <div className="absolute inset-[3px] bg-black" />
            </div>
            <span className="font-mono text-base font-black text-white tracking-widest uppercase">IRIS</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com/irisprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-[#00FFA3] transition-colors"
            >
              [ Twitter ]
            </a>
            <a
              href="https://discord.gg/dEYDYrcrQ3"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-[#00FFA3] transition-colors"
            >
              [ Discord ]
            </a>
            <a
              href="#"
              className="font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-[#00FFA3] transition-colors"
            >
              [ Docs ]
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
            © 2025 IRIS Protocol. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">// Built on Solana</p>
        </div>
      </div>
    </footer>
  )
}
