import { Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const techStack = [
  {
    tag: 'LAYER_01',
    title: 'Solana Smart Contracts',
    description:
      'Lightning-fast transaction processing and low fees enable real-time protective actions when every second counts.',
  },
  {
    tag: 'LAYER_02',
    title: 'Python AI Risk Model',
    description:
      'State-of-the-art machine learning trained on historical crash data, social signals, and whale patterns.',
  },
  {
    tag: 'LAYER_03',
    title: 'Data Oracles & Whale Trackers',
    description:
      'Real-time feeds from Pyth Network and proprietary whale tracking algorithms provide early warning indicators.',
  },
  {
    tag: 'LAYER_04',
    title: 'NFT-Based Insurance Protocol',
    description: 'Revolutionary tokenized insurance policies backed by smart contracts for instant claim resolution.',
  },
]

const useCases = [
  {
    id: '1',
    badge: 'HIGH VOLATILITY PROTECTION',
    title: 'DeFi Degens',
    description: 'High-risk traders who need a safety net when experimenting with new protocols and tokens.',
  },
  {
    id: '2',
    badge: 'RUGPULL DETECTION',
    title: 'Retail Altcoin Holders',
    description: 'Everyday crypto users who want to protect their investments from sudden market downturns.',
  },
  {
    id: '3',
    badge: 'COMING SOON',
    title: 'Protocol Integrations',
    description: 'DeFi platforms that want to offer built-in asset protection to their users.',
  },
]

export const TechnologySection = () => {
  return (
    <section id="technology" className="relative bg-[#050505] border-b border-white/10 py-24 overflow-hidden">
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
            [ TECH_STACK ]
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Technology Stack */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="border border-[#00FFA3]/40 p-2">
                <Zap className="h-4 w-4 text-[#00FFA3]" />
              </div>
              <h3 className="font-mono text-sm font-black uppercase tracking-widest text-white">
                Our Technology Stack
              </h3>
            </div>

            <div className="border border-white/10 divide-y divide-white/10">
              {techStack.map((item, i) => (
                <motion.div
                  key={item.tag}
                  className="p-6 hover:bg-[#00FFA3]/[0.03] transition-colors group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <span className="font-mono text-[9px] text-[#00FFA3]/40 uppercase tracking-widest mb-2 block">
                    // {item.tag}
                  </span>
                  <h4 className="font-mono text-sm font-black uppercase tracking-wider text-white mb-2 group-hover:text-[#00FFA3] transition-colors">
                    {item.title}
                  </h4>
                  <p className="font-mono text-xs text-white/50 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div id="use-cases">
            <div className="flex items-center gap-3 mb-8">
              <div className="border border-[#0088FF]/40 p-2">
                <Shield className="h-4 w-4 text-[#0088FF]" />
              </div>
              <h3 className="font-mono text-sm font-black uppercase tracking-widest text-white">Who Needs IRIS</h3>
            </div>

            <div className="space-y-0 border border-white/10 divide-y divide-white/10">
              {useCases.map((uc, i) => (
                <motion.div
                  key={uc.id}
                  className="flex gap-6 p-6 hover:bg-[#0088FF]/[0.03] transition-colors group"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 border border-[#0088FF]/30 flex items-center justify-center group-hover:border-[#0088FF] transition-colors">
                    <span className="font-mono text-sm font-black text-[#0088FF]">{uc.id}</span>
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-black uppercase tracking-wider text-white mb-2">
                      {uc.title}
                    </h4>
                    <p className="font-mono text-xs text-white/50 mb-3 leading-relaxed">{uc.description}</p>
                    <span className="font-mono text-[9px] border border-[#0088FF]/30 px-2 py-1 text-[#0088FF]/70 uppercase tracking-widest">
                      {uc.badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
