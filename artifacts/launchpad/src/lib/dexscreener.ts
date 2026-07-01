import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.dexscreener.com";

export type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative: string;
  priceUsd?: string;
  txns: { h24: { buys: number; sells: number } };
  volume: { h24: number };
  priceChange: { h24: number };
  liquidity?: { usd: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    socials?: { type: string; url: string }[];
  };
};

export type DexBoostToken = {
  tokenAddress: string;
  chainId: string;
  url: string;
  icon?: string;
  name?: string;
  description?: string;
  amount: number;
  totalAmount: number;
  links?: { type: string; url: string; label?: string }[];
};

export function useTrendingTokens() {
  return useQuery<DexBoostToken[]>({
    queryKey: ["dexscreener", "boosted"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/token-boosts/top/v1`);
      if (!res.ok) throw new Error("DexScreener API error");
      const data = await res.json();
      return Array.isArray(data) ? data.slice(0, 20) : [];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useTokenSearch(query: string) {
  return useQuery<{ pairs: DexPair[] }>({
    queryKey: ["dexscreener", "search", query],
    queryFn: async () => {
      const res = await fetch(`${BASE}/latest/dex/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("DexScreener search error");
      return res.json();
    },
    enabled: query.length >= 2,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useTokenPairs(chainId: string, address: string) {
  return useQuery<{ pairs: DexPair[] }>({
    queryKey: ["dexscreener", "pairs", chainId, address],
    queryFn: async () => {
      const res = await fetch(`${BASE}/latest/dex/pairs/${chainId}/${address}`);
      if (!res.ok) throw new Error("DexScreener pairs error");
      return res.json();
    },
    enabled: !!chainId && !!address,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useTopBscPairs() {
  const knownPairs = [
    "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0",
    "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16",
    "0x74E4716E431f45807DCF19f284c7aa99F18a4fbc",
    "0xEc6557348085Aa57C72514D67070dC863C0a5A8c",
    "0x7EFaEf62fDdCCa950418312c6C702357a7Cf9bF5",
  ];
  return useQuery<DexPair[]>({
    queryKey: ["dexscreener", "top-bsc"],
    queryFn: async () => {
      const addr = knownPairs.join(",");
      const res = await fetch(`${BASE}/latest/dex/pairs/bsc/${addr}`);
      if (!res.ok) throw new Error("DexScreener BSC error");
      const data = await res.json();
      return data.pairs || [];
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 2,
  });
}
