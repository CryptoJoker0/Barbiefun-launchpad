/**
 * Launch data module — all reads/writes go through the shared REST API.
 *
 * The API server persists launches in PostgreSQL so every user sees the
 * same feed. This module is the single point of contact: swap the fetch
 * calls here if the API URL ever changes.
 */

const API_BASE = "/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Launch = {
  id: string;
  name: string;
  ticker: string;
  description: string;
  website?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  totalSupply: string;
  chainId: number;
  chainName: string;
  deployer: string;
  feeTxHash: string;
  createdAt: string; // ISO date string from the API
  verified?: boolean;
  /** true = mint authority still active; false = renounced */
  mintAuthority?: boolean;
  /** true = freeze authority still active; false = disabled (SVM only) */
  freezeAuthority?: boolean;
  /** Referral code captured from ?ref= at the time of launch */
  referredBy?: string | null;
  /** Object storage path for the token logo (/objects/uploads/<uuid>) or null */
  logoUrl?: string | null;
};

export type CreateLaunch = Omit<Launch, "createdAt">;

// ── Internal fetch helper ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getLaunches(): Promise<Launch[]> {
  return apiFetch<Launch[]>("/launches");
}

export async function addLaunch(launch: CreateLaunch): Promise<Launch> {
  return apiFetch<Launch>("/launches", {
    method: "POST",
    body: JSON.stringify(launch),
  });
}

export async function getLaunchById(id: string): Promise<Launch | undefined> {
  try {
    return await apiFetch<Launch>(`/launches/${id}`);
  } catch {
    return undefined;
  }
}

export async function setLaunchVerified(
  id: string,
  verified: boolean,
): Promise<void> {
  await apiFetch(`/launches/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ verified }),
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function formatSupply(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString();
}
