/**
 * Real, client-recorded launches — no fabricated/mock tokens.
 *
 * This app does not yet run its own indexer/backend, so there is no
 * cross-user token database. Instead, every wallet that successfully pays
 * the on-chain launch fee through this app gets a genuine record saved to
 * their own browser (localStorage), keyed by chain + tx hash. This keeps
 * the Discovery feed and token pages showing only real, user-originated
 * activity instead of seeded demo data.
 *
 * Swapping this for a real backend later only requires replacing the
 * functions below (get/add) with API calls — every consumer already goes
 * through this module.
 */

export type Launch = {
  id: string;
  name: string;
  ticker: string;
  description: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  totalSupply: string;
  chainId: number;
  chainName: string;
  deployer: string;
  feeTxHash: string;
  createdAt: string;
  /** true once a team reviewer has approved the project's Verify application */
  verified?: boolean;
};

const STORAGE_KEY = "barbiefun.launches.v1";

export function getLaunches(): Launch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addLaunch(launch: Launch): void {
  if (typeof window === "undefined") return;
  const existing = getLaunches();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([launch, ...existing]));
}

export function getLaunchById(id: string): Launch | undefined {
  return getLaunches().find((l) => l.id === id);
}

/**
 * Marks a launch verified/unverified. This is the reviewer-side action a
 * team member takes after evaluating a Verify application (see Verify.tsx).
 * There's no backend yet, so the decision is persisted to the same
 * localStorage record the rest of the app already reads from — swapping
 * this for a real review-queue API later is a drop-in replacement.
 */
export function setLaunchVerified(id: string, verified: boolean): void {
  if (typeof window === "undefined") return;
  const existing = getLaunches();
  const updated = existing.map((l) => (l.id === id ? { ...l, verified } : l));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function formatSupply(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString();
}
