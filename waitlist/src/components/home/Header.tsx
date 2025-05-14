import { useState } from 'react'
import { Menu, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/home/MobileNav'

export const Header = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#1A1F2C]/90 border-b border-white/10 shadow-lg">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-[#8B5CF6] mr-2" />
            <span className="font-inter text-2xl tracking-wider">IRIS Protocol</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#demo" className="text-white/70 hover:text-white transition-colors">
              Demo
            </a>
            <a href="#technology" className="text-white/70 hover:text-white transition-colors">
              Technology
            </a>
            <a href="#use-cases" className="text-white/70 hover:text-white transition-colors">
              Use Cases
            </a>
            <Button
              className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white font-inter tracking-wider"
              onClick={() => {
                const el = document.getElementById('waitlist-form')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Sign up for Waitlist
            </Button>
          </div>
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setMobileNavOpen(true)}>
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  )
}
