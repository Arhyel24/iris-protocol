"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import NavbarRightItems from './NavbarRightItems'
import { useRouter } from 'next/navigation'
import { LoginButton } from "@/components/auth/AuthButtons"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const isAuthenticated = !!user
  const isHomePage = typeof window !== 'undefined' ? window.location.pathname === '/' : true

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  const handleOpenNotifications = () => {
    if (isAuthenticated) router.push('/notifications')
  }

  const authLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Insurance', href: '/insurance' },
    { name: 'Wallets', href: '/wallets' },
  ]

  const publicLinks = [
    { name: 'Docs', href: '/docs' },
    { name: 'FAQ', href: '/faq' },
  ]

  const navLinks = isAuthenticated ? authLinks : [...publicLinks]

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled || !isHomePage
      ? 'bg-black/90 backdrop-blur-md border-white/20'
      : 'bg-black border-transparent'
    }`

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={navClasses}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="IRIS Protocol Home">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary border border-primary relative">
                <div className="absolute inset-1 bg-black" />
              </div>
              <p className="font-mono text-xl font-black text-white tracking-widest uppercase">
                IRIS
              </p>
              <span className="px-1.5 py-0.5 text-[0.6rem] font-mono border border-primary text-primary tracking-widest uppercase">
                BUILD_02
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = typeof window !== 'undefined' && window.location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-mono tracking-widest uppercase transition-colors relative group ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-6 left-0 w-full h-0.5 bg-primary transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              )
            })}
          </div>

          {/* Right-Side Items */}
          <div className="flex items-center">
            <div className="hidden md:flex">
              <NavbarRightItems onOpenNotifications={handleOpenNotifications} />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-none border border-transparent hover:border-white/20">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-2 border-white/20 rounded-none font-mono">
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild className="rounded-none hover:bg-white/10 hover:text-primary focus:bg-white/10 focus:text-primary cursor-pointer">
                      <Link href={link.href} className="w-full px-2 py-2 text-sm text-gray-300 uppercase tracking-wider">
                        {link.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem asChild className="rounded-none hover:bg-white/10 hover:text-primary cursor-pointer">
                        <Link href="/notifications" className="w-full px-2 py-2 text-sm text-gray-300 uppercase">
                          Notifications
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-none hover:bg-white/10 hover:text-primary cursor-pointer">
                        <Link href="/settings" className="w-full px-2 py-2 text-sm text-gray-300 uppercase">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut} className="text-red-500 rounded-none hover:bg-red-500/10 cursor-pointer uppercase">
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild className="rounded-none p-0">
                      <div className="w-full">
                        <LoginButton />
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
