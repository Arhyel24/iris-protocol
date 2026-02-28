import { Monitor, Search, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    id: '01',
    icon: Monitor,
    label: 'REAL_TIME_MONITOR',
    title: 'Real-Time Monitoring',
    description: '24/7 surveillance of your portfolio positions and market conditions',
  },
  {
    id: '02',
    icon: Search,
    label: 'AI_RISK_ALERTS',
    title: 'AI-Driven Risk Alerts',
    description: 'Machine learning algorithms identify potential threats before they impact your assets',
  },
  {
    id: '03',
    icon: Shield,
    label: 'AUTO_PROTECTION',
    title: 'Auto Asset Protection',
    description: 'Swift automated actions to secure your assets when threats are detected',
  },
  {
    id: '04',
    icon: Zap,
    label: 'NFT_INSURANCE',
    title: 'NFT-Based Insurance',
    description: 'Blockchain-secured insurance protocols that guarantee your coverage',
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
