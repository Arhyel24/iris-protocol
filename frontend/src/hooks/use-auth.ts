"use client";

/**
 * IRIS Protocol — Wallet-based JWT authentication hook.
 *
 * On wallet connect:
 *   1. POST /auth/challenge  → nonce + message
 *   2. signMessage(message)  → signature (Uint8Array)
 *   3. POST /auth/verify     → access_token + refresh_token + user
 *
 * If user.email is null after login, the hook signals "needs-email" so the
 * caller can redirect to /setup.
 */

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useJwt } from "@/contexts/JwtContext";

export type AuthFlowState =
  | "idle" // wallet not connected
  | "signing" // wallet connected, waiting for user to sign
  | "verifying" // signature submitted, waiting for backend
  | "authenticated" // logged in + has email
  | "needs-email" // logged in but no email on record
  | "error"; // sign or verify failed

/** Pages that should NOT trigger the auth redirect loop */
const PUBLIC_PATHS = [
  "/",
  "/faq",
  "/terms",
  "/privacy",
  "/about",
  "/help",
  "/support",
  "/setup",
];

function uint8ToBase64(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
}

export function useAuth(): { state: AuthFlowState; error: string | null } {
  const { connected, publicKey, signMessage } = useWallet();
  const { isAuthenticated, isLoading, user, _storeAuth, logout } = useJwt();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthFlowState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Prevent running the flow multiple times simultaneously
  const inFlight = useRef(false);

  useEffect(() => {
    // Wallet disconnected → clear auth
    if (!connected || !publicKey) {
      setState("idle");
      if (isAuthenticated) logout();
      return;
    }

    // Wait for JwtContext to finish restoring from localStorage.
    // Without this guard, autoConnect fires before we know the user is already
    // authenticated, triggering an unwanted signMessage popup.
    if (isLoading) return;

    // Already authenticated
    if (isAuthenticated) {
      setState(user?.email ? "authenticated" : "needs-email");
      if (
        !user?.email &&
        !PUBLIC_PATHS.includes(pathname) &&
        pathname !== "/setup"
      ) {
        router.push(`/setup?from=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    // Don't re-run if already in-flight
    if (inFlight.current) return;

    // Wait for signMessage to be available (some wallets expose it async)
    if (!signMessage) return;

    const runLogin = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      setError(null);

      try {
        // Step 1 — Challenge
        setState("signing");
        const { nonce, message } = await api.challenge(publicKey.toBase58());

        // Step 2 — Sign
        if (!signMessage)
          throw new Error("Wallet does not support message signing.");
        const sigBytes = await signMessage(new TextEncoder().encode(message));
        const signature = uint8ToBase64(sigBytes);

        // Step 3 — Verify
        setState("verifying");
        const result = await api.verify(publicKey.toBase58(), nonce, signature);
        _storeAuth(result.access_token, result.refresh_token, result.user);

        if (result.user.email) {
          setState("authenticated");
        } else {
          setState("needs-email");
          if (!PUBLIC_PATHS.includes(pathname) && pathname !== "/setup") {
            router.push(`/setup?from=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err: unknown) {
        setState("error");
        setError(err instanceof Error ? err.message : "Authentication failed.");
        logout();
      } finally {
        inFlight.current = false;
      }
    };

    runLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connected,
    publicKey?.toBase58(),
    isAuthenticated,
    isLoading,
    !!signMessage,
  ]);

  // After already-authenticated, sync email state
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.email) {
      setState("authenticated");
    } else {
      setState("needs-email");
    }
  }, [isAuthenticated, user?.email]);

  return { state, error };
}
