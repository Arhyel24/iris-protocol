"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import NavbarRightItems from './NavbarRightItems'
import { useRouter } from 'next/navigation'
import { LoginButton } from "@/components/auth/AuthButtons";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const isAuthenticated = !!user
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  const handleOpenNotifications = () => {
    if (isAuthenticated) {
      router.push('/notifications')
    }
  }

  const authLinks = [
    { name: 'Dashboard', href: '/dashboard', requiresAuth: true },
    { name: 'Protection', href: '/protection', requiresAuth: true },
    { name: 'Insurance', href: '/insurance', requiresAuth: true },
    { name: 'Claim', href: '/claim', requiresAuth: true },
    { name: 'Wallets', href: '/wallets', requiresAuth: true },
  ]

  const publicLinks = [
    { name: 'Docs', href: '/docs', requiresAuth: false },
    { name: 'FAQ', href: '/faq', requiresAuth: false },
  ]

  // Display navbar links depending on auth status
  const navLinks = isAuthenticated ? authLinks : [...publicLinks]

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled || !isHomePage ? 'bg-iris-dark/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
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
          <Link href="/" className="flex items-center space-x-2" aria-label="IRIS Protocol Home">
            <div className="flex items-center space-x-1">
              <Shield className="h-6 w-6 text-iris-purple" />
              <p
                className="font-orbitron text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-iris-purple-light to-iris-blue-light"
              >
                IRIS
              </p>
              <Badge variant="outline" className="ml-2 text-xs font-medium text-iris-blue-light">
                BETA
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.href
                    ? 'bg-iris-purple/10 text-iris-purple'
                    : 'text-gray-300 hover:bg-iris-purple/5 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right-Side Items (Notifications, Settings, Sign In) */}
          <div className="flex items-center">
            {/* Non-mobile display of right items */}
            <div className="hidden md:flex">
              <NavbarRightItems onOpenNotifications={handleOpenNotifications} />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white focus:outline-none">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-iris-darker border-iris-purple/20">
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild>
                      <Link
                        href={link.href}
                        className={`w-full px-2 py-2 text-sm ${
                          location.pathname === link.href ? 'text-iris-purple' : 'text-gray-300'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/notifications" className="w-full px-2 py-2 text-sm text-gray-300">
                          Notifications
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="w-full px-2 py-2 text-sm text-gray-300">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut} className="text-red-500 cursor-pointer">
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      {/* <DropdownMenuItem asChild>
                        <Link href="/auth?mode=login" className="w-full px-2 py-2 text-sm text-gray-300">
                          Sign In
                        </Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuItem asChild>
                        {/* <Link href="/auth?mode=signup" className="w-full px-2 py-2 text-sm text-iris-purple">
                          Join Waitlist
                          </Link> */}
                          <LoginButton />
                      </DropdownMenuItem>
                    </>
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
