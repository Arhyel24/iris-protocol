import { WaitlistForm } from '@/components/home/WaitlistForm'
import { motion } from 'framer-motion'

const perks = [
  'Priority onboarding when IRIS goes live',
  'Early access to the insurance API integration sandbox',
  'Discounted settlement fees for founding users',
  'IRIS OG badge — on-chain proof of early support',
]

export const CtaSection = () => {
  return (
    <section className="relative bg-black border-b border-white/10 py-24 overflow-hidden" id="waitlist-form">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, #00FFA3 1px, transparent 1px), linear-gradient(to bottom, #00FFA3 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-[#00FFA3]/40" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section label */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono text-[10px] text-[#00FFA3] uppercase tracking-widest border border-[#00FFA3] px-2 py-1">
            [ EARLY_ACCESS ]
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="font-mono text-4xl md:text-6xl font-black uppercase tracking-tighter text-white text-center mb-4 leading-[0.9]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Protect Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#0088FF]">
              Portfolio Now.
            </span>
          </motion.h2>

          <motion.p
            className="font-mono text-xs text-white/40 uppercase tracking-widest text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            // Limited spots for the first wave
          </motion.p>

          {/* Perks */}
          <motion.div
            className="border border-white/10 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="border-b border-white/10 px-6 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00FFA3]" />
              <span className="font-mono text-[10px] text-[#00FFA3]/70 uppercase tracking-widest">
                EARLY_ACCESS_PERKS
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="font-mono text-[#00FFA3] text-xs">{'>'}</span>
                  <span className="font-mono text-xs text-white/60">{perk}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Waitlist form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <WaitlistForm />
          </motion.div>

          <motion.p
            className="font-mono text-[10px] text-white/30 uppercase tracking-widest text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Drop your email &amp; stand by for Alpha access.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
