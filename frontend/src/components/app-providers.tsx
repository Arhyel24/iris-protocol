"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import { ReactQueryProvider } from "./react-query-provider";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { JwtProvider } from "@/contexts/JwtContext";
import { useAuth } from "@/hooks/use-auth";

/** Runs the wallet→jwt auth flow globally. Must be inside WalletProvider + JwtProvider. */
function AuthGate({ children }: { children: React.ReactNode }) {
  useAuth(); // side-effect only — challenges+signs on connect
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const endpoint =
    process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ReactQueryProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <JwtProvider>
              <AuthGate>
                <TooltipProvider>
                  <Toaster richColors position="top-right" />
                  {children}
                </TooltipProvider>
              </AuthGate>
            </JwtProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ReactQueryProvider>
  );
}
