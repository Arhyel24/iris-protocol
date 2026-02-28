import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

const menuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
}

const MenuItems = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#demo', label: 'Demo' },
  { href: '#technology', label: 'Technology' },
  { href: '#use-cases', label: 'Use Cases' },
]

export const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-3/4 bg-black border-l border-[#00FFA3]/50 shadow-[-20px_0_50px_rgba(0,255,163,0.1)]"
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00FFA3 1px, transparent 1px), linear-gradient(90deg, #00FFA3 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <div className="flex flex-col p-6 relative z-10">
              <div className="flex justify-end mb-8 border-b border-white/10 pb-4">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-none hover:bg-white/10 text-white">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="mb-8 font-mono text-[10px] text-primary uppercase tracking-widest border border-primary px-2 py-1 inline-block w-fit">
                SYSTEM_MENU_ACTV
              </div>

              <nav className="flex flex-col space-y-6">
                {MenuItems.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    custom={i}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={onClose}
                    className="text-2xl font-black font-mono uppercase tracking-widest text-white/50 hover:text-[#00FFA3] hover:pl-4 transition-all"
                  >
                    {item.label}
                  </motion.a>
                ))}
                <motion.div
                  custom={MenuItems.length}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="pt-8 mt-8 border-t border-white/10"
                >
                  <Button
                    className="w-full bg-transparent hover:bg-[#00FFA3] border-2 border-[#00FFA3] text-[#00FFA3] hover:text-black font-mono font-bold tracking-widest uppercase rounded-none transition-colors py-6 text-lg"
                    onClick={() => {
                      onClose()
                      const el = document.getElementById('waitlist-form')
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    INIT_WAITLIST
                  </Button>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
