'use client'

import { useEffect } from 'react'
import { Header } from '@/components/home/Header'
import { HeroSection } from '@/components/home/HeroSection'
import { FeatureSection } from '@/components/home/FeatureSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { DemoSection } from '@/components/home/DemoSection'
import { TechnologySection } from '@/components/home/TechnologySection'
import { CtaSection } from '@/components/home/CtaSection'
import { Footer } from '@/components/home/Footer'

export default function Home() {
  // Enable smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Header />
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <DemoSection />
      <TechnologySection />
      <CtaSection />
      <Footer />
    </div>
  )
}
