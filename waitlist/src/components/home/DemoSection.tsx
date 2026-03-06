import { Activity, AlarmClock, Lock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const events = [
  { icon: Activity, label: 'API_CLAIM_RECEIVED', text: 'Real-world insurance API submits a validated claim event' },
  { icon: AlarmClock, label: 'ESCROW_CLAIM_VERIFIED', text: 'IRIS smart contract verifies claim against policy terms' },
  { icon: Lock, label: 'PAYOUT_UNLOCKED', text: 'Escrow releases funds to the policyholder wallet' },
  { icon: Shield, label: 'SETTLEMENT_CONFIRMED', text: 'On-chain settlement record finalized on Solana' },
]

export const DemoSection = () => {
  return (
    <section id="demo" className="relative bg-black border-b border-white/10 py-24 overflow-hidden">
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
            [ LIVE_DEMO ]
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/10">
          {/* Video demo placeholder */}
          <motion.div
            className="relative aspect-video border-r border-white/10 overflow-hidden bg-[#050505] flex items-center justify-center group cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Scanline effect */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
              }}
            />

            {/* Corner accents */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#00FFA3]" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#00FFA3]" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#00FFA3]" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#00FFA3]" />

            <div className="text-center relative z-20">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 border-2 border-[#00FFA3] flex items-center justify-center group-hover:bg-[#00FFA3]/10 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-[#00FFA3]"
                    style={{ marginLeft: '4px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                    />
                  </svg>
                </div>
              </div>
              <p className="font-mono text-xs text-[#00FFA3]/60 uppercase tracking-widest">
                // WATCH: CLAIM_SETTLEMENT_FLOW
              </p>
            </div>
          </motion.div>

          {/* Demo explanation */}
          <motion.div
            className="p-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="font-mono text-[9px] text-[#00FFA3]/50 uppercase tracking-widest mb-3 block">
              // CLAIM_SETTLEMENT_DEMO
            </span>
            <h3 className="font-mono text-xl font-black uppercase tracking-wider text-white mb-4">
              End-to-End Claim Settlement
            </h3>
            <p className="font-mono text-xs text-white/50 mb-8 leading-relaxed">
              Watch how IRIS receives a claim from a real-world insurance API and settles the payout to the
              policyholder&apos;s wallet via escrow in seconds:
            </p>

            {/* Event log */}
            <div className="border border-white/10 mb-8">
              <div className="border-b border-white/10 px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00FFA3] animate-pulse" />
                <span className="font-mono text-[10px] text-[#00FFA3]/70 uppercase tracking-widest">
                  IRIS_EVENT_LOG
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {events.map((event, i) => {
                  const Icon = event.icon
                  return (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                    >
                      <div className="border border-[#00FFA3]/30 p-1 flex-shrink-0 mt-0.5">
                        <Icon className="h-3 w-3 text-[#00FFA3]" />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-[#00FFA3]/40 uppercase tracking-widest block mb-0.5">
                          {event.label}
                        </span>
                        <span className="font-mono text-xs text-white/70">{event.text}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Testimonial */}
            <div className="border border-white/10 p-6 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00FFA3]" />
              <p className="font-mono text-xs italic text-white/60 mb-4 leading-relaxed">
                &ldquo;Our travel insurance provider integrated with IRIS in a weekend. Premiums are settled on-chain
                and payouts hit customer wallets before they even land at the airport.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-[#00FFA3]/40 flex items-center justify-center">
                  <span className="font-mono text-[10px] text-[#00FFA3] font-bold">AK</span>
                </div>
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-white">Amir Kowalski</p>
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                    InsurTech Integration Partner
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
