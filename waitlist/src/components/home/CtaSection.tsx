import { WaitlistForm } from '@/components/home/WaitlistForm'
import { motion } from 'framer-motion'

export const CtaSection = () => {
  return (
    <section className="py-20 relative overflow-hidden" id="waitlist-form">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 to-[#1EAEDB]/20 z-0"></div>
      <div className="absolute -top-[50%] -left-[30%] w-[60%] h-[100%] bg-[#8B5CF6]/10 rounded-full blur-[120px] z-0"></div>
      <div className="absolute -bottom-[50%] -right-[30%] w-[60%] h-[100%] bg-[#1EAEDB]/10 rounded-full blur-[120px] z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="font-space text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Protect Your Portfolio Now
          </motion.h2>
          <motion.div
            className="flex flex-col items-center justify-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-xl text-white/80 mb-4">
              <span className="font-inter text-white/70">🔐 Early Access Perks:</span>
            </p>
            <ul className="text-white/80 text-left space-y-2 mb-6 mx-auto max-w-sm list-disc list-inside">
              <li>Priority onboarding when we launch</li>
              <li>Exclusive NFT insurance tier for early users</li>
              <li>Access to experimental risk-detection models</li>
              <li>IRIS OG badge</li>
            </ul>
            <p className="text-lg text-white/80 mb-4 text-center">
              Ready to get ahead of the whales?
              <br />
              <span className="font-inter">Drop your email and we&apos;ll notify you when IRIS goes live.</span>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <WaitlistForm />
          </motion.div>
          <div className="mt-8 text-white/60">
            <p className="font-inter">Limited spots available for the first wave</p>
          </div>
        </div>
      </div>
    </section>
  )
}
