"use client";

import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";
import { ReactQueryProvider } from "./react-query-provider";

import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

// import("@solana/wallet-adapter-react-ui/styles.css");

export function AppProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const endpoint = "https://api.devnet.solana.com";
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ReactQueryProvider>
       <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner /><CivicAuthProvider>
        <AuthProvider>
          {children}
        </AuthProvider></CivicAuthProvider>
            </TooltipProvider>
            </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </ReactQueryProvider>
  );
}
