import React from 'react'
import { Github, Twitter, Book, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-16 border-t font-mono border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.5)_50%,transparent_75%)] bg-[length:10px_10px]" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">
                IRIS PROTOCOL
              </h3>
            </div>

            <p className="text-muted-foreground text-sm mb-8 max-w-sm leading-relaxed border-l-2 border-white/20 pl-4">
              The on-chain settlement layer for real-world insurance APIs.
              Pay in USDC, get covered instantly.
            </p>

            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-muted-foreground hover:bg-white hover:text-black transition-colors">
                <Github size={18} />
              </a>
              <a href="https://twitter.com/irisprotocol" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-muted-foreground hover:bg-primary hover:border-primary hover:text-black transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://discord.gg/dEYDYrcrQ3" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-muted-foreground hover:bg-[#5865F2] hover:border-[#5865F2] hover:text-white transition-colors">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-6 uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span>[<span className="text-transparent group-hover:text-primary font-bold">{'>'}</span>]</span> Documentation</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span>[<span className="text-transparent group-hover:text-primary font-bold">{'>'}</span>]</span> FAQ</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span>[<span className="text-transparent group-hover:text-primary font-bold">{'>'}</span>]</span> Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><span>[<span className="text-transparent group-hover:text-primary font-bold">{'>'}</span>]</span> Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-6 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">Dashboard</Link></li>
              <li><Link href="/insurance" className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">Get Covered</Link></li>
              <li><Link href="/wallets" className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">Manage Wallets</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between text-xs text-muted-foreground uppercase tracking-widest">
          <p>SYS_VER: 0.2.0-BETA</p>
          <p>© {new Date().getFullYear()} IRIS. ALL SYSTEMS OPERATIONAL.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
