import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/home/MobileNav'

export const Header = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#00FFA3] border border-[#00FFA3] relative">
              <div className="absolute inset-1 bg-black" />
            </div>
            <span className="font-mono text-xl font-black text-white tracking-widest uppercase">
              IRIS
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-[#00FFA3] transition-colors">
              [ Flow ]
            </a>
            <a href="#technology" className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-[#00FFA3] transition-colors">
              [ Tech ]
            </a>
            <Button
              className="bg-transparent hover:bg-[#00FFA3] text-[#00FFA3] hover:text-black border border-[#00FFA3] font-mono text-xs rounded-none uppercase tracking-widest transition-colors"
              onClick={() => {
                const el = document.getElementById('waitlist-form')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Join Waitlist
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-white rounded-none border border-transparent hover:border-white/20" onClick={() => setMobileNavOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  )
}
