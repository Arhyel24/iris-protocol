/**
 * IRIS Protocol — Authenticated API client.
 *
 * Automatically attaches the JWT Bearer token from localStorage to every
 * request, and silently refreshes on 401 responses.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Token store (localStorage) ─────────────────────────────────────────────────

const KEYS = {
  access: "iris_access_token",
  refresh: "iris_refresh_token",
  user: "iris_user",
} as const;

export const tokenStore = {
  getAccess: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(KEYS.access) : null,
  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(KEYS.refresh) : null,
  getUser: <T = unknown>(): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEYS.user);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set: (access: string, refresh: string, user?: unknown) => {
    localStorage.setItem(KEYS.access, access);
    localStorage.setItem(KEYS.refresh, refresh);
    if (user !== undefined)
      localStorage.setItem(KEYS.user, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(KEYS.access);
    localStorage.removeItem(KEYS.refresh);
    localStorage.removeItem(KEYS.user);
  },
};

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  wallet: string;
  email: string | null;
  role: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  userId: string;
  quoteId: string;
  productType: string;
  coverageAmount: number;
  premiumAmount: number;
  monthlyPremium: number;
  durationMonths: number;
  paymentsCount: number;
  nextPaymentDue: string | null;
  currency: string;
  status: string; // active | expired | cancelled
  startDate: string;
  endDate: string;
  premiumTxHash: string | null;
  escrowAccount: string | null;
  insuranceRef: string | null;
  createdAt: string;
}

export interface PremiumPayment {
  id: string;
  policyId: string;
  paymentIndex: number;
  amount: number;
  txHash: string | null;
  status: "paid" | "failed";
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Claim {
  id: string;
  policyId: string;
  status: string; // pending | approved | rejected | paid
  description: string;
  incidentDate: string;
  proofHash: string | null;
  payoutAmount: number | null;
  payoutTxHash: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
}

// ── Admin types ────────────────────────────────────────────────────────────────

const ADMIN_BASE = `/api/v1/x-iris-ops/v1`;
const ADMIN_BASE_FULL = `${BASE}${ADMIN_BASE}`;

export interface AdminStats {
  totalUsers: number;
  totalPolicies: number;
  activePolicies: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalPremiumCollected: number;
}

export interface AdminUser {
  id: string;
  wallet: string;
  email: string | null;
  role: string;
  createdAt: string;
  policyCount: number;
  claimCount: number;
}

export interface AdminPolicy {
  id: string;
  userId: string;
  userWallet: string;
  userEmail: string | null;
  quoteId: string;
  productType: string;
  coverageAmount: number;
  premiumAmount: number;
  monthlyPremium: number;
  durationMonths: number;
  paymentsCount: number;
  nextPaymentDue: string | null;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  premiumTxHash: string | null;
  escrowAccount: string | null;
  insuranceRef: string | null;
  createdAt: string;
}

export interface AdminClaim {
  id: string;
  policyId: string;
  userId: string;
  userWallet: string;
  userEmail: string | null;
  productType: string;
  coverageAmount: number;
  status: string;
  description: string;
  incidentDate: string;
  proofHash: string | null;
  payoutAmount: number | null;
  payoutTxHash: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  escrowAccount: string | null;
  createdAt: string;
}

export interface ChainStatus {
  oracleWallet: string;
  oracleSolBalance: number;
  treasuryPda: string;
  treasuryUsdcBalance: number;
  programId: string;
  cluster: string;
}

export interface ActivityLogEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export const adminApi = {
  // OTP (no JWT needed — called before portal login)
  requestOtp: (wallet: string) =>
    fetch(`${ADMIN_BASE_FULL}/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "OTP request failed");
      return d as { ok: boolean; message: string };
    }),
  verifyOtp: (wallet: string, code: string) =>
    fetch(`${ADMIN_BASE_FULL}/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, code }),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "OTP verify failed");
      return d as { ok: boolean; message: string };
    }),

  // Chain status (requires JWT)
  chainStatus: () => apiFetch<ChainStatus>(`${ADMIN_BASE}/chain-status`),

  // Activity log
  activity: (actionFilter?: string, limit = 100) =>
    apiFetch<ActivityLogEntry[]>(
      `${ADMIN_BASE}/activity?limit=${limit}${actionFilter ? `&action_filter=${actionFilter}` : ""}`,
    ),

  stats: () => apiFetch<AdminStats>(`${ADMIN_BASE}/stats`),

  // Users
  users: () => apiFetch<AdminUser[]>(`${ADMIN_BASE}/users`),
  setUserRole: (userId: string, role: string) =>
    apiFetch<AdminUser>(`${ADMIN_BASE}/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  // Policies
  policies: () => apiFetch<AdminPolicy[]>(`${ADMIN_BASE}/policies`),
  setPolicyStatus: (policyId: string, status: string) =>
    apiFetch<AdminPolicy>(`${ADMIN_BASE}/policies/${policyId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Claims
  claims: (statusFilter?: string) =>
    apiFetch<AdminClaim[]>(
      `${ADMIN_BASE}/claims${statusFilter ? `?status_filter=${statusFilter}` : ""}`,
    ),
  reviewClaim: (
    claimId: string,
    data: {
      decision: string;
      reviewNote?: string;
      payoutAmount?: number;
      adminSignature?: string;
    },
  ) =>
    apiFetch<AdminClaim>(`${ADMIN_BASE}/claims/${claimId}/review`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export interface Quote {
  id: string;
  userId: string;
  productType: string;
  coverageAmount: number;
  premiumAmount: number;
  currency: string;
  status: string;
  insuranceRef: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────────

let _refreshing: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  // Deduplicate concurrent refreshes
  if (_refreshing) return _refreshing;

  _refreshing = (async () => {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return null;
      }
      const data = await res.json();
      tokenStore.set(data.access_token, data.refresh_token);
      return data.access_token as string;
    } catch {
      tokenStore.clear();
      return null;
    } finally {
      _refreshing = null;
    }
  })();

  return _refreshing;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = tokenStore.getAccess();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Try to refresh once on 401
  if (res.status === 401) {
    const newToken = await attemptRefresh();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  // Return raw Response for 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Typed API helpers ──────────────────────────────────────────────────────────

export const api = {
  // Auth
  challenge: (wallet: string) =>
    apiFetch<{ nonce: string; message: string }>("/api/v1/auth/challenge", {
      method: "POST",
      body: JSON.stringify({ wallet }),
    }),

  verify: (wallet: string, nonce: string, signature: string) =>
    apiFetch<{ access_token: string; refresh_token: string; user: ApiUser }>(
      "/api/v1/auth/verify",
      {
        method: "POST",
        body: JSON.stringify({ wallet, nonce, signature }),
      },
    ),

  // User
  patchUser: (wallet: string, data: { email?: string }) =>
    apiFetch<ApiUser>(`/api/v1/users/${wallet}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Policies
  myPolicies: () => apiFetch<Policy[]>("/api/v1/policies/me"),
  cancelPolicy: (id: string, reason?: string) =>
    apiFetch<Policy>(`/api/v1/policies/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
  createPolicy: (data: {
    quoteId: string;
    premiumTxHash: string;
    escrowAccount?: string;
    monthlyPremium?: number;
    durationMonths?: number;
  }) =>
    apiFetch<Policy>("/api/v1/policies/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  premiumPayments: (policyId: string) =>
    apiFetch<PremiumPayment[]>(`/api/v1/policies/${policyId}/payments`),

  // Claims
  myClaims: () => apiFetch<Claim[]>("/api/v1/claims/me"),
  policyClaims: (policyId: string) =>
    apiFetch<Claim[]>(`/api/v1/claims/policy/${policyId}`),
  fileClaim: (data: {
    policyId: string;
    description: string;
    incidentDate: string;
    proofHash?: string;
  }) =>
    apiFetch<Claim>("/api/v1/claims", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Quotes
  requestQuote: (data: {
    productType: string;
    coverageAmount: number;
    currency?: string;
    details?: unknown;
  }) =>
    apiFetch<Quote>("/api/v1/quotes", {
      method: "POST",
      body: JSON.stringify({ currency: "USDC", ...data }),
    }),
};
