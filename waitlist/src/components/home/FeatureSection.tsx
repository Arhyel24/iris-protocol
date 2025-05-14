import { Monitor, Search, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export const FeatureSection = () => {
  return (
    <section className="bg-[#171C27] py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="flex flex-col items-center text-center p-6"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#1EAEDB] flex items-center justify-center mb-6">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-space font-bold mb-3">Real-Time Monitoring</h3>
            <p className="text-white/70">24/7 surveillance of your portfolio positions and market conditions</p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="flex flex-col items-center text-center p-6"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1EAEDB] to-[#D946EF] flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-space font-bold mb-3">AI-Driven Risk Alerts</h3>
            <p className="text-white/70">
              Machine learning algorithms identify potential threats before they impact your assets
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-85px' }}
            transition={{ duration: 0.5, delay: 0.19 }}
            className="flex flex-col items-center text-center p-6"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#D946EF] to-[#8B5CF6] flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-space font-bold mb-3">Auto Asset Protection</h3>
            <p className="text-white/70">Swift automated actions to secure your assets when threats are detected</p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="flex flex-col items-center text-center p-6"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#F97316] to-[#D946EF] flex items-center justify-center mb-6">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-space font-bold mb-3">NFT-Based Insurance</h3>
            <p className="text-white/70">Blockchain-secured insurance protocols that guarantee your coverage</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
