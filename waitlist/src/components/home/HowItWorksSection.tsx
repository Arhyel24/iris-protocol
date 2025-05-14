import { Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-space font-bold text-center mb-16">How IRIS Protects You</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-b from-[#8B5CF6]/20 to-transparent rounded-xl blur-xl"></div>
            <Card className="p-8 h-full bg-[#1E2330]/80 border border-white/10 backdrop-blur-sm">
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center border border-[#8B5CF6]/40">
                  <span className="font-inter text-2xl text-[#8B5CF6]">01</span>
                </div>
              </div>
              <h3 className="text-xl font-space font-bold mb-4 text-center">Connect Wallet</h3>
              <p className="text-white/70 text-center">
                Securely link your Solana wallet to IRIS for monitoring. No fund transfers required - IRIS only
                observes.
              </p>
            </Card>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            className="relative mt-10 md:mt-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.19 }}
          >
            <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-b from-[#1EAEDB]/20 to-transparent rounded-xl blur-xl"></div>
            <Card className="p-8 h-full bg-[#1E2330]/80 border border-white/10 backdrop-blur-sm">
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-[#1EAEDB]/20 flex items-center justify-center border border-[#1EAEDB]/40">
                  <span className="font-inter text-2xl text-[#1EAEDB]">02</span>
                </div>
              </div>
              <h3 className="text-xl font-space font-bold mb-4 text-center">IRIS Monitors Portfolio</h3>
              <p className="text-white/70 text-center">
                AI algorithms constantly analyze your holdings against market data, whale movements, and protocol risks.
              </p>
            </Card>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            className="relative mt-10 md:mt-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-b from-[#D946EF]/20 to-transparent rounded-xl blur-xl"></div>
            <Card className="p-8 h-full bg-[#1E2330]/80 border border-white/10 backdrop-blur-sm">
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-[#D946EF]/20 flex items-center justify-center border border-[#D946EF]/40">
                  <span className="font-inter text-2xl text-[#D946EF]">03</span>
                </div>
              </div>
              <h3 className="text-xl font-space font-bold mb-4 text-center">IRIS Reacts Instantly</h3>
              <p className="text-white/70 text-center">
                When threats are detected, IRIS automatically swaps at-risk assets, triggers insurance, and alerts you.
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Bonus info */}
        <div className="mt-16 bg-gradient-to-r from-[#1E2330] to-[#1A1F2C] border border-white/10 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-[#F97316]/20 p-3 rounded-lg mr-4">
              <Zap className="h-6 w-6 text-[#F97316]" />
            </div>
            <div>
              <h4 className="font-space font-bold mb-1">NFT Staking Boost</h4>
              <p className="text-white/70">
                Stake IRIS NFTs to upgrade coverage tiers and unlock premium protection features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
