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
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-3/4 bg-[#1A1F2C] border-l border-white/10 shadow-xl"
          >
            <div className="flex flex-col p-6">
              <div className="flex justify-end mb-8">
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                {MenuItems.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    custom={i}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={onClose}
                    className="text-lg font-inter tracking-wider text-white/70 hover:text-white transition-colors px-4 py-2"
                  >
                    {item.label}
                  </motion.a>
                ))}
                <motion.div
                  custom={MenuItems.length}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="pt-4"
                >
                  <Button className="w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white font-inter tracking-wider">
                    JOIN THE BETA
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
