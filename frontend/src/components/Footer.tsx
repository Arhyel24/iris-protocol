import React from 'react'
import { Github, Twitter, Book, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const Footer: React.FC = () => {
  return (
    <footer className="bg-iris-darker py-12 border-t border-iris-purple/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-orbitron text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-iris-purple-light to-iris-blue-light">
              IRIS Protocol
            </h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              AI-powered risk protection for your DeFi portfolio on Solana. Real-time monitoring, automated swaps, and
              insurance against market volatility.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com/irisprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://discord.gg/dEYDYrcrQ3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <MessageSquare size={20} />
              </a>
              <Link href="/docs" className="text-muted-foreground hover:text-white transition-colors">
                <Book size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/swap"
                  className="text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                >
                  Token Swap
                </Link>
              </li>
              <li>
                <Link href="/protection" className="text-muted-foreground hover:text-white transition-colors">
                  Protection Settings
                </Link>
              </li>
              <li>
                <Link href="/insurance" className="text-muted-foreground hover:text-white transition-colors">
                  NFT Insurance
                </Link>
              </li>
              <li>
                <Link href="/claim" className="text-muted-foreground hover:text-white transition-colors">
                  File a Claim
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-iris-purple/10 mt-12 pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} IRIS Protocol. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
