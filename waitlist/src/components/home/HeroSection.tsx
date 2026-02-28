import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-black border-b border-white/10 pt-24 pb-32">
      {/* Primitive Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #00FFA322 1px, transparent 1px), linear-gradient(to bottom, #00FFA322 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-8 px-4 py-2 border border-[#00FFA3] bg-[#00FFA3]/10 text-[#00FFA3] font-mono text-sm uppercase tracking-widest"
          >
            [ WAITLIST OPEN_ ]
          </motion.div>

          <motion.h1
            className="font-mono text-5xl md:text-7xl lg:text-8xl font-black mb-8 text-white uppercase tracking-tighter leading-[0.9]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Bridge <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#0088FF]">Fiat</span> <br />
            With <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0088FF] to-[#00FFA3]">Solana.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/60 font-mono mb-12 max-w-2xl mx-auto border-l-2 border-[#00FFA3] pl-4 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            IRIS protocol is the ultimate settlement layer for Real-World Insurance APIs.
            Pay your premiums on-chain. Receive payouts securely via Escrow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              className="bg-[#00FFA3] hover:bg-white text-black font-bold font-mono text-lg px-12 py-8 border-2 border-[#00FFA3] rounded-none uppercase tracking-widest transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(0,255,163,0.4)]"
              onClick={() => {
                const el = document.getElementById('waitlist-form')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Join Alpha
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
