"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type ApiUser, api, tokenStore } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

interface JwtContextValue {
  user: ApiUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** true while the login flow or initial token restore is running */
  isLoading: boolean;
  setUser: (user: ApiUser) => void;
  logout: () => void;
  /** Call this after the wallet sign-verify flow completes. */
  _storeAuth: (access: string, refresh: string, user: ApiUser) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const JwtContext = createContext<JwtContextValue>({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
  _storeAuth: () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────────

export function JwtProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore from localStorage on mount
  useEffect(() => {
    const token = tokenStore.getAccess();
    const storedUser = tokenStore.getUser<ApiUser>();
    if (token && storedUser) {
      setAccessToken(token);
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const _storeAuth = useCallback(
    (access: string, refresh: string, u: ApiUser) => {
      tokenStore.set(access, refresh, u);
      setAccessToken(access);
      setUserState(u);
    },
    [],
  );

  const setUser = useCallback((u: ApiUser) => {
    setUserState(u);
    // Update stored user too
    const access = tokenStore.getAccess() ?? "";
    const refresh = tokenStore.getRefresh() ?? "";
    tokenStore.set(access, refresh, u);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setAccessToken(null);
    setUserState(null);
  }, []);

  return (
    <JwtContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        setUser,
        logout,
        _storeAuth,
      }}
    >
      {children}
    </JwtContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useJwt() {
  return useContext(JwtContext);
}

// Helper: GET /api/v1/users/:wallet to refresh user data
export async function refreshUserFromApi(
  wallet: string,
): Promise<ApiUser | null> {
  try {
    return await api.patchUser(wallet, {}); // PATCH with empty body = no-op, returns current user
  } catch {
    return null;
  }
}
