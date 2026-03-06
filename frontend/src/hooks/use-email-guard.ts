"use client";

/**
 * Simplified email guard  uses JwtContext (set by useAuth in AuthGate).
 *
 * States:
 *  "idle"         wallet not connected / auth not started
 *  "checking"     JWT login flow in progress
 *  "ok"           authenticated + email on record
 *  "needs-email"  authenticated but no email (redirect handled by useAuth)
 */

import { useWallet } from "@solana/wallet-adapter-react";
import { useJwt } from "@/contexts/JwtContext";

export type EmailGuardState = "idle" | "checking" | "ok" | "needs-email";

export function useEmailGuard(): EmailGuardState {
  const { connected } = useWallet();
  const { isAuthenticated, isLoading, user } = useJwt();

  if (!connected) return "idle";
  // JWT is being restored from localStorage
  if (isLoading) return "checking";
  // Wallet connected but sign flow not yet done (AuthGate is handling it)
  if (!isAuthenticated) return "checking";
  if (!user?.email) return "needs-email";
  return "ok";
}
