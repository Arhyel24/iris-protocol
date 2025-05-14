import { Zap, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

export const TechnologySection = () => {
  return (
    <section id="technology" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-space font-bold text-center mb-16">Technology + Use Cases</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Technology Stack */}
          <div>
            <h3 className="text-2xl font-space font-bold mb-8 flex items-center">
              <Zap className="mr-2 text-[#1EAEDB] h-6 w-6" /> Our Technology Stack
            </h3>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-[#1E2330]/80 border border-white/10 p-6 hover:border-[#8B5CF6]/50 transition-colors">
                  <h4 className="font-space font-bold text-lg mb-2">Solana Smart Contracts</h4>
                  <p className="text-white/70">
                    Lightning-fast transaction processing and low fees enable real-time protective actions when every
                    second counts.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-90px' }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-[#1E2330]/80 border border-white/10 p-6 hover:border-[#1EAEDB]/50 transition-colors">
                  <h4 className="font-space font-bold text-lg mb-2">Python AI Risk Model</h4>
                  <p className="text-white/70">
                    State-of-the-art machine learning trained on historical crash data, social signals, and whale
                    patterns.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-[#1E2330]/80 border border-white/10 p-6 hover:border-[#D946EF]/50 transition-colors">
                  <h4 className="font-space font-bold text-lg mb-2">Data Oracles & Whale Trackers</h4>
                  <p className="text-white/70">
                    Real-time feeds from Pyth Network and proprietary whale tracking algorithms provide early warning
                    indicators.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-[#1E2330]/80 border border-white/10 p-6 hover:border-[#F97316]/50 transition-colors">
                  <h4 className="font-space font-bold text-lg mb-2">NFT-Based Insurance Protocol</h4>
                  <p className="text-white/70">
                    Revolutionary tokenized insurance policies backed by smart contracts for instant claim resolution.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Use Cases */}
          <div id="use-cases">
            <h3 className="text-2xl font-space font-bold mb-8 flex items-center">
              <Shield className="mr-2 text-[#8B5CF6] h-6 w-6" /> Who Needs IRIS
            </h3>

            <div className="space-y-8">
              {/* Use Case 1 */}
              <motion.div
                className="flex"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex-shrink-0 mr-6 mt-1">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 flex items-center justify-center border border-[#8B5CF6]/30">
                    <span className="font-inter text-4xl text-[#8B5CF6]">1</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-space font-bold text-lg mb-2">DeFi Degens</h4>
                  <p className="text-white/70 mb-3">
                    High-risk traders who need a safety net when experimenting with new protocols and tokens.
                  </p>
                  <div className="bg-white/5 rounded-full inline-block px-3 py-1 text-xs font-inter tracking-wider text-[#8B5CF6]">
                    HIGH VOLATILITY PROTECTION
                  </div>
                </div>
              </motion.div>

              {/* Use Case 2 */}
              <motion.div
                className="flex"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-90px' }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex-shrink-0 mr-6 mt-1">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#1EAEDB]/20 to-[#1EAEDB]/5 flex items-center justify-center border border-[#1EAEDB]/30">
                    <span className="font-inter text-4xl text-[#1EAEDB]">2</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-space font-bold text-lg mb-2">Retail Altcoin Holders</h4>
                  <p className="text-white/70 mb-3">
                    Everyday crypto users who want to protect their investments from sudden market downturns.
                  </p>
                  <div className="bg-white/5 rounded-full inline-block px-3 py-1 text-xs font-inter tracking-wider text-[#1EAEDB]">
                    RUGPULL DETECTION
                  </div>
                </div>
              </motion.div>

              {/* Use Case 3 */}
              <motion.div
                className="flex"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex-shrink-0 mr-6 mt-1">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#D946EF]/20 to-[#D946EF]/5 flex items-center justify-center border border-[#D946EF]/30">
                    <span className="font-inter text-4xl text-[#D946EF]">3</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-space font-bold text-lg mb-2">Protocol Integrations</h4>
                  <p className="text-white/70 mb-3">
                    DeFi platforms that want to offer built-in asset protection to their users.
                  </p>
                  <div className="bg-white/5 rounded-full inline-block px-3 py-1 text-xs font-inter tracking-wider text-[#D946EF]">
                    COMING SOON
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
