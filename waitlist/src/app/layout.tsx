import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import React from 'react'

export const metadata: Metadata = {
  title: 'IRIS Protocol – Your AI-Powered DeFi Insurance Agent',
  description:
    'IRIS Protocol protects your crypto portfolio using real-time AI risk scoring and NFT-based insurance. Built on Solana to guard your assets before crashes happen.',
  authors: [{ name: 'IRIS Protocol Team' }],
  openGraph: {
    title: 'IRIS Protocol – AI-Powered DeFi Insurance',
    description:
      'IRIS monitors your DeFi portfolio in real-time and reacts to threats instantly. Auto swaps. NFT insurance. Built on Solana.',
    url: 'https://irisprotocol.xyz',
    type: 'website',
    images: [
      {
        url: 'https://iris-guardian.vercel.app/images/IRIS-banner.png',
        alt: 'IRIS Protocol Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IRIS Protocol – Real-Time DeFi Protection',
    description:
      'Your AI-powered insurance agent for DeFi. Instant protection, NFT-based coverage, and real-time asset safety.',
    site: '@irisprotocol_xyz',
    images: [
      {
        url: 'https://iris-guardian.vercel.app/images/IRIS-banner.png',
        alt: 'IRIS Protocol Banner',
      },
    ],
  },
}


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
