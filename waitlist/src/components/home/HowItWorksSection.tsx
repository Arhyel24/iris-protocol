import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  {
    id: '01',
    title: 'Connect & Select Policy',
    description: 'Link your Solana wallet and choose a real-world insurance product from any integrated API provider.',
    tag: 'INIT_HANDSHAKE',
  },
  {
    id: '02',
    title: 'Pay Premium On-Chain',
    description:
      'Your premium is sent on-chain and locked in an IRIS escrow contract — fully transparent and verifiable.',
    tag: 'PREMIUM_SETTLED',
  },
  {
    id: '03',
    title: 'Receive Payout via Escrow',
    description:
      'When a valid claim is triggered by the insurance API, IRIS releases your payout from escrow instantly.',
    tag: 'PAYOUT_RELEASED',
  },
]

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative bg-[#050505] border-b border-white/10 py-24 overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #00FFA3 1px, transparent 1px), linear-gradient(to bottom, #00FFA3 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-[10px] text-[#00FFA3] uppercase tracking-widest border border-[#00FFA3] px-2 py-1">
            [ PROTOCOL_FLOW ]
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              className="group relative p-8 border-r border-white/10 last:border-r-0 hover:bg-[#00FFA3]/[0.03] transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              {/* Corner accent on hover */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00FFA3] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Step number */}
              <div className="mb-8">
                <span className="font-mono text-5xl font-black text-[#00FFA3] opacity-20 select-none">{step.id}</span>
              </div>

              {/* Tag */}
              <span className="font-mono text-[9px] text-[#00FFA3]/50 uppercase tracking-widest mb-4 block">
                // {step.tag}
              </span>

              <h3 className="font-mono text-base font-black uppercase tracking-wider text-white mb-4">{step.title}</h3>
              <p className="font-mono text-xs text-white/50 leading-relaxed">{step.description}</p>

              {/* Connector arrow — not on last */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#00FFA3]/30 font-mono text-lg">
                  &gt;
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* NFT Staking Boost */}
        <motion.div
          className="mt-0 border border-t-0 border-white/10 p-6 flex items-center gap-4 hover:bg-[#00FFA3]/[0.03] transition-colors group"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="border border-[#00FFA3]/40 p-3 group-hover:border-[#00FFA3] transition-colors flex-shrink-0">
            <Zap className="h-5 w-5 text-[#00FFA3]" />
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#00FFA3]/50 uppercase tracking-widest block mb-1">
              // SETTLEMENT_LAYER
            </span>
            <h4 className="font-mono text-sm font-black uppercase tracking-wider text-white mb-1">
              Settlement Finality
            </h4>
            <p className="font-mono text-xs text-white/50">
              Every premium and payout is recorded on-chain — giving policyholders and providers full auditability.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
