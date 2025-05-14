import { Activity, AlarmClock, Lock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export const DemoSection = () => {
  return (
    <section id="demo" className="bg-[#171C27] py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-space font-bold text-center mb-16">See IRIS In Action</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Video demo placeholder */}
          <motion.div
            className="relative aspect-video rounded-xl overflow-hidden border border-[#8B5CF6]/30"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E2330] to-[#1A1F2C] flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center backdrop-blur-sm border border-[#8B5CF6]/40 cursor-pointer hover:bg-[#8B5CF6]/30 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-10 h-10 text-[#8B5CF6]"
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
                <p className="mt-6 text-lg font-inter text-white/70">WATCH DEMO: TOKEN CRASH SCENARIO</p>
              </div>
            </div>
          </motion.div>

          {/* Demo explanation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-space font-bold mb-6">Protecting Against Token Crash</h3>
            <p className="text-white/70 mb-6">
              Watch as IRIS detects unusual whale movement on a token pair and takes immediate action to protect the
              user&apos;s assets:
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="bg-[#1EAEDB]/20 p-1 rounded-full mr-3 mt-1">
                  <Activity className="h-4 w-4 text-[#1EAEDB]" />
                </span>
                <span className="text-white/80">IRIS identifies suspicious token movement</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#F97316]/20 p-1 rounded-full mr-3 mt-1">
                  <AlarmClock className="h-4 w-4 text-[#F97316]" />
                </span>
                <span className="text-white/80">Risk assessment algorithm triggers alert</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#D946EF]/20 p-1 rounded-full mr-3 mt-1">
                  <Lock className="h-4 w-4 text-[#D946EF]" />
                </span>
                <span className="text-white/80">Automatic swap to stablecoin before price impact</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#8B5CF6]/20 p-1 rounded-full mr-3 mt-1">
                  <Shield className="h-4 w-4 text-[#8B5CF6]" />
                </span>
                <span className="text-white/80">NFT insurance claim triggered to cover any losses</span>
              </li>
            </ul>

            {/* Testimonial */}
            <div className="rounded-xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <p className="italic text-white/80 mb-4">
                &quot;IRIS saved me 70% of my portfolio when $MEME crashed. The AI detected the dump pattern before I
                even saw the price move.&quot;
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#1EAEDB] flex items-center justify-center mr-3">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div>
                  <p className="font-bold">John Defi</p>
                  <p className="text-white/60 text-sm">Early Beta Tester</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
