import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <div className="relative pt-24 pb-16 md:pb-24 lg:pb-32 overflow-hidden bg-black border-b border-white/10">
      {/* Primitive Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider backdrop-blur-sm">
              <span className="w-2 h-2 rounded-none bg-primary animate-pulse" />
              Mainnet Escrows Live
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter text-white uppercase" style={{ fontFamily: 'monospace' }}>
              Real-World <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Insurance.</span><br />
              On-Chain.
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl font-mono mb-8 max-w-xl border-l-2 border-primary pl-4">
              Pay premiums in USDC. Get claims disbursed instantly to your Solana wallet. Powered by global Web2 Insurance APIs, secured by Web3 Escrows.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 font-mono uppercase tracking-widest text-sm">
              <Link href="/insurance">
                <button className="w-full sm:w-auto bg-primary hover:bg-white hover:text-black text-black font-bold py-4 px-8 border-2 border-primary transition-all duration-200 flex items-center justify-center gap-2 group">
                  Get Covered <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/docs">
                <button className="w-full sm:w-auto bg-transparent hover:bg-white/5 text-white font-bold py-4 px-8 border-2 border-white/20 transition-all duration-200">
                  Read Docs
                </button>
              </Link>
            </div>
          </div>

          <div className="relative border border-white/10 bg-black/50 backdrop-blur-md p-6 overflow-hidden group hover:border-primary/50 transition-colors duration-500">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

            <div className="relative z-10 aspect-square flex flex-col items-center justify-center text-center p-8">
              <ShieldCheck className="w-32 h-32 text-primary mb-8" strokeWidth={1} />
              <h3 className="text-2xl font-mono font-bold text-white uppercase mb-2">Escrow Status: Secure</h3>
              <p className="text-muted-foreground font-mono text-sm">Treasury: 42,000 USDC<br />Active Policies: 1,402</p>
            </div>

            {/* Scanning line effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 shadow-[0_0_10px_rgba(0,255,163,0.5)] animate-scan" style={{ animation: 'scan 3s linear infinite' }} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}} />
    </div>
  );
};

export default Hero;
