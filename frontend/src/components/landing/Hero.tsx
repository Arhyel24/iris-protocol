
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <div className="relative pt-20 pb-16 md:pb-24 lg:pb-32 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-iris-purple/20 rounded-full filter blur-[120px] -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-iris-blue/20 rounded-full filter blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-iris-purple-light via-iris-purple to-iris-blue">
                AI-Powered Risk Protection
              </span>
              <br />
              <span className="text-white">for DeFi</span>
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-xl">
              IRIS uses advanced AI to monitor your Solana portfolio 24/7, automatically preventing 
              major losses before they happen. Real-time risk scoring, smart swaps, and insurance in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button className="neo-button w-full sm:w-auto">
                  Launch App <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" className="border-iris-purple/30 hover:bg-iris-purple/5 transition-colors w-full sm:w-auto">
                  Read the Docs
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-iris-purple/30 to-iris-blue/30 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-iris-purple/40 to-iris-blue/40 animate-pulse delay-300"></div>
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-iris-purple/50 to-iris-blue/50 animate-pulse delay-500"></div>
              
              {/* Neural Network visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-[320px] max-h-[320px] relative">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <g stroke="url(#irisGradient)" strokeWidth="0.5" fill="none">
                      {/* Neural network visualization */}
                      <circle cx="100" cy="100" r="60" className="opacity-60" />
                      <circle cx="100" cy="100" r="40" className="opacity-80" />
                      <circle cx="100" cy="100" r="20" className="opacity-100" />
                      
                      {/* Connection lines */}
                      <line x1="40" y1="40" x2="160" y2="160" />
                      <line x1="40" y1="160" x2="160" y2="40" />
                      <line x1="100" y1="20" x2="100" y2="180" />
                      <line x1="20" y1="100" x2="180" y2="100" />
                      
                      {/* Nodes */}
                      <circle cx="40" cy="40" r="5" fill="url(#irisGradient)" />
                      <circle cx="160" cy="160" r="5" fill="url(#irisGradient)" />
                      <circle cx="40" cy="160" r="5" fill="url(#irisGradient)" />
                      <circle cx="160" cy="40" r="5" fill="url(#irisGradient)" />
                      <circle cx="100" cy="20" r="5" fill="url(#irisGradient)" />
                      <circle cx="100" cy="180" r="5" fill="url(#irisGradient)" />
                      <circle cx="20" cy="100" r="5" fill="url(#irisGradient)" />
                      <circle cx="180" cy="100" r="5" fill="url(#irisGradient)" />
                      <circle cx="100" cy="100" r="10" fill="url(#irisGradient)" />
                    </g>
                    
                    <defs>
                      <linearGradient id="irisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9B87F5" />
                        <stop offset="100%" stopColor="#1EAEDB" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Scanning effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-iris-purple/20 to-transparent h-20 animate-scan opacity-60"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
