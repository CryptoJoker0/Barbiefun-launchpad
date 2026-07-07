import { useQuery } from "@tanstack/react-query";

/**
 * Live USD pricing for native gas tokens, used to compute the $5 launch fee
 * in native-token terms. Structured so a different/paid price feed
 * (Chainlink, Pyth, a backend proxy, etc.) can be swapped in later by only
 * changing `fetchUsdPrice` below — every consumer just calls
 * `useNativeTokenPriceUsd` / `useLaunchFeeNative`.
 */

const COINGECKO_IDS: Record<string, string> = {
  BNB: "binancecoin",
  ETH: "ethereum",   // covers both Base and Robinhood Chain (both use ETH)
  OKB: "okb",
  SOL: "solana",
};

// Used only if the live feed is temporarily unreachable, so the UI never
// breaks — clearly marked as non-live in the UI when this path is hit.
const FALLBACK_USD_PRICES: Record<string, number> = {
  BNB: 620,
  ETH: 2500,
  OKB: 55,
  SOL: 175,
};

async function fetchUsdPrice(symbol: string): Promise<number | null> {
  const id = COINGECKO_IDS[symbol];
  if (!id) return null;
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
  if (!res.ok) throw new Error(`Price fetch failed for ${symbol}`);
  const data = await res.json();
  const price = data?.[id]?.usd;
  return typeof price === "number" ? price : null;
}

export function useNativeTokenPriceUsd(symbol: string) {
  return useQuery({
    queryKey: ["native-price", symbol],
    queryFn: () => fetchUsdPrice(symbol),
    enabled: !!COINGECKO_IDS[symbol],
    staleTime: 45_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

export const LAUNCH_FEE_USD = 5;

/** Standard-track verification review, processed in 24-48 hours. */
export const VERIFICATION_FEE_STANDARD_USD = 80;
/** Fast-track verification review, jumps the review queue. */
export const VERIFICATION_FEE_FAST_USD = 100;

export type VerificationTier = "standard" | "fast";

export function verificationFeeUsd(tier: VerificationTier): number {
  return tier === "fast" ? VERIFICATION_FEE_FAST_USD : VERIFICATION_FEE_STANDARD_USD;
}

export type LaunchFee = {
  usd: number;
  native: number | null;
  symbol: string;
  /** true when the amount reflects a real-time price feed */
  isLive: boolean;
  loading: boolean;
};

/**
 * Resolves a USD fee into a native-token amount for the given chain
 * symbol. Stable-gas chains (Tempo/Arc, both USD-pegged) are always
 * exactly 1:1. Everything else uses the CoinGecko feed with a static fallback.
 */
export function useFeeNative(usd: number, symbol: string, isStableGas?: boolean): LaunchFee {
  const { data, isLoading, isError } = useNativeTokenPriceUsd(symbol);

  if (isStableGas) {
    return { usd, native: usd, symbol, isLive: true, loading: false };
  }

  const livePrice = data ?? null;
  const price = livePrice ?? FALLBACK_USD_PRICES[symbol] ?? null;

  return {
    usd,
    native: price ? usd / price : null,
    symbol,
    isLive: !!livePrice && !isError,
    loading: isLoading,
  };
}

export function useLaunchFeeNative(symbol: string, isStableGas?: boolean): LaunchFee {
  return useFeeNative(LAUNCH_FEE_USD, symbol, isStableGas);
}

export function formatNativeAmount(amount: number | null): string {
  if (amount === null) return "—";
  if (amount < 0.001) return amount.toFixed(6);
  if (amount < 1) return amount.toFixed(4);
  return amount.toFixed(3);
}
