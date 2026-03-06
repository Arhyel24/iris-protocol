import { Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const techStack = [
  {
    tag: 'LAYER_01',
    title: 'Solana Smart Contracts',
    description:
      'Anchor programs handle premium collection, escrow locking, and trustless payout release at sub-second speed.',
  },
  {
    tag: 'LAYER_02',
    title: 'Real-World Insurance API Layer',
    description:
      'A standardized adapter layer that connects any external insurance provider API to the IRIS settlement contracts.',
  },
  {
    tag: 'LAYER_03',
    title: 'Escrow Settlement Engine',
    description:
      'Funds are held in on-chain escrow and released automatically when a claim event is validated by the API.',
  },
  {
    tag: 'LAYER_04',
    title: 'On-Chain Audit Trail',
    description:
      'Every premium payment and payout is recorded immutably on Solana — full transparency for all parties.',
  },
]

const useCases = [
  {
    id: '1',
    badge: 'ON-CHAIN PREMIUMS',
    title: 'Policyholders',
    description:
      'Individuals who want to pay real-world insurance premiums on-chain and receive payouts without intermediaries.',
  },
  {
    id: '2',
    badge: 'API INTEGRATION',
    title: 'Insurance Providers',
    description:
      'InsurTech companies and traditional insurers who want to settle claims on Solana via the IRIS API layer.',
  },
  {
    id: '3',
    badge: 'COMING SOON',
    title: 'Protocol Builders',
    description:
      'DeFi protocols and fintech teams who want to embed real-world insurance settlement into their products.',
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
