import { useEffect } from "react";
import { useSearch } from "wouter";

const REF_KEY = "barbiefun.referral";

/**
 * Call once near the app root. Reads ?ref=xxx from the URL and persists
 * it to sessionStorage so it survives page navigations within the same tab.
 */
export function useReferral() {
  const search = useSearch();
  useEffect(() => {
    const params = new URLSearchParams(search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem(REF_KEY, ref);
    }
  }, [search]);
}

/**
 * Returns the referral code stored this session (set by useReferral),
 * or null if the user arrived without a ?ref= param.
 */
export function getReferral(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REF_KEY);
}
