import { Globe, Lock, Zap, FileCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    id: '01',
    icon: Globe,
    label: 'RWI_API_BRIDGE',
    title: 'Real-World Insurance APIs',
    description: 'Connect any real-world insurance provider to Solana through a unified settlement layer',
  },
  {
    id: '02',
    icon: Zap,
    label: 'ON_CHAIN_PREMIUMS',
    title: 'On-Chain Premium Payments',
    description: 'Pay your insurance premiums directly on-chain — fast, transparent, and borderless',
  },
  {
    id: '03',
    icon: Lock,
    label: 'ESCROW_PAYOUTS',
    title: 'Escrow-Secured Payouts',
    description: 'Claims are settled via trustless escrow contracts — funds released automatically on approval',
  },
  {
    id: '04',
    icon: FileCheck,
    label: 'SETTLEMENT_FINAL',
    title: 'Instant Settlement',
    description: 'Solana-speed finality means your payout lands in seconds, not weeks',
  },
]

export const FeatureSection = () => {
  return (
    <section className="relative bg-black border-b border-white/10 py-24 overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, #00FFA3 1px, transparent 1px), linear-gradient(to bottom, #00FFA3 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-[10px] text-[#00FFA3] uppercase tracking-widest border border-[#00FFA3] px-2 py-1">
            [ CORE_FEATURES ]
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative p-8 border-r border-b border-white/10 last:border-r-0 [&:nth-child(2n)]:lg:border-r [&:nth-child(4n)]:lg:border-r-0 hover:bg-[#00FFA3]/5 transition-colors"
              >
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00FFA3] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00FFA3] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* ID */}
                <span className="font-mono text-[10px] text-[#00FFA3]/50 uppercase tracking-widest mb-6 block">
                  {feature.id}_
                </span>

                {/* Icon */}
                <div className="mb-6 w-10 h-10 border border-[#00FFA3]/40 flex items-center justify-center group-hover:border-[#00FFA3] transition-colors">
                  <Icon className="h-5 w-5 text-[#00FFA3]" />
                </div>

                {/* Label tag */}
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3 block">
                  // {feature.label}
                </span>

                <h3 className="font-mono text-sm font-black uppercase tracking-wider text-white mb-3">
                  {feature.title}
                </h3>
                <p className="font-mono text-xs text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
