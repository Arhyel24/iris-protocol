import { Button } from '@/components/ui/button'
import { MovingGradient } from '@/components/home/MovingGradient'
import { motion } from 'framer-motion'
import Image from 'next/image'
import myImageLoader from '../image-loader'

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <MovingGradient />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30 z-0"></div>
      <div className="absolute -top-[30%] -right-[10%] w-[50%] h-[70%] bg-[#8B5CF6]/30 rounded-full blur-[150px] z-0"></div>
      <div className="absolute -bottom-[30%] -left-[10%] w-[50%] h-[70%] bg-[#1EAEDB]/20 rounded-full blur-[150px] z-0"></div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="font-space text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            DeFi is risky. <span className="text-[#8B5CF6]">IRIS</span> is your shield.
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            IRIS watches your wallet 24/7 and reacts instantly to market risks.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white font-inter text-lg px-8 py-6 rounded-lg transition-all shadow-lg shadow-[#8B5CF6]/50 tracking-wider"
              onClick={() => {
                const el = document.getElementById('waitlist-form')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Sign up for Waitlist
            </Button>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <motion.div
              className="flex items-center bg-white/5 px-4 py-2 rounded-md backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Image src="/images/solana-sol-logo.png" alt="Solana" height={6} width={6} className="h-6 w-6 mr-2" />
              <span className="text-white/70 font-inter">SOLANA</span>
            </motion.div>
            <motion.div
              className="flex items-center bg-white/5 px-4 py-2 rounded-md backdrop-blur-sm gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <svg
                width="24"
                height="30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                className="h-6 w-6 mr-2"
              >
                <path
                  d="M14.664 12.299a2.855 2.855 0 0 1-2.854 2.856v2.856a5.71 5.71 0 0 0 5.708-5.712A5.71 5.71 0 0 0 8.956 7.35a5.708 5.708 0 0 0-2.854 4.948v14.28l2.566 2.57.288.287V12.3a2.855 2.855 0 1 1 5.708 0Z"
                  fill="#E6DAFE"
                ></path>
                <path
                  d="M11.811.867c-2.08 0-4.029.557-5.708 1.53a11.417 11.417 0 0 0-2.854 2.34 11.386 11.386 0 0 0-2.854 7.555v8.57l2.854 2.855V12.292a8.552 8.552 0 0 1 2.854-6.387 8.545 8.545 0 0 1 5.708-2.182c4.729 0 8.563 3.837 8.563 8.57 0 4.731-3.834 8.568-8.563 8.568v2.856c6.306 0 11.417-5.115 11.417-11.425 0-6.31-5.111-11.425-11.417-11.425Z"
                  fill="#E6DAFE"
                ></path>
              </svg>
              <span className="text-white/70 font-inter">PYTH NETWORK</span>
            </motion.div>
            <motion.div
              className="flex items-center bg-white/5 px-4 py-2 rounded-md backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Image
                loader={myImageLoader}
                quality={70}
                src="https://www.colosseum.org/images/logos/colosseum-logo-white.svg"
                alt="Colosseum"
                height={40}
                width={180}
                className="max-w-[9.5rem] md:max-w-[11.15rem]"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
