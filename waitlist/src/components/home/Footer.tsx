import { Shield } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-8 bg-[#171C27]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-[#8B5CF6] mr-2" />
            <span className="font-inter text-xl">IRIS Protocol</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://twitter.com/irisprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://discord.gg/dEYDYrcrQ3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              Discord
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              Docs
            </a>
          </div>
        </div>

        <div className="mt-6 text-center md:text-left">
          <p className="text-sm text-white/40 text-center md:text-left">© 2025 IRIS Protocol. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
