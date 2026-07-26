/**
 * X1TokenTracker — live token price widget for the X1 Blockchain ecosystem.
 *
 * Data source: /api/x1/tokens — a server-side proxy that fetches from
 * x1scr.xyz (CORS-free) and caches responses for 30 s.
 * Falls back to a curated featured-projects snapshot when the proxy is down.
 */

import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, RefreshCw, ExternalLink,
  Wifi, WifiOff, Flame, BarChart2,
} from "lucide-react";
import ChainIcon from "@/components/ChainIcon";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type X1Token = {
  address: string;
  name: string;
  symbol: string;
  priceUsd: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  marketCap: number | null;
  logo?: string;
  pairUrl?: string;
  source: "x1scr" | "static";
};

// ---------------------------------------------------------------------------
// Curated featured projects — hand-picked snapshot, shown only when the
// live proxy is unreachable.
// ---------------------------------------------------------------------------
const FEATURED_X1_TOKENS: X1Token[] = [
  {
    address: "7deZorr98nLdZhpmSdUgu8WY4NAjSpeLDGxHzaTAxrUg",
    name: "X1 Brains",
    symbol: "BRAINS",
    priceUsd: 0.005273,
    priceChange24h: -1.39,
    volume24h: 99.08,
    liquidity: 11270,
    marketCap: 39090,
    logo: "https://gptree.vip/token-profiles/EpKRiKwbCKZDZE9pgH48HcXqQkBunXUK-logo-1770004011249-d9cb417d589c14a2.webp",
    pairUrl: "https://x1.ninja/pair/7deZorr98nLdZhpmSdUgu8WY4NAjSpeLDGxHzaTAxrUg",
    source: "static",
  },
  {
    address: "99MjDDtQzNxo11yNTL71bQCubNGCePncN8zWYrDBSH9t",
    name: "Degen",
    symbol: "DGN.X",
    priceUsd: 0.0003,
    priceChange24h: 3.29,
    volume24h: 49.79,
    liquidity: 2110,
    marketCap: 138510,
    logo: "https://ipfs.io/ipfs/bafkreicoi7s3nahwhdtazbhhp7ktmlot4f7doh6xep27epcdxuz47adequ",
    pairUrl: "https://x1.ninja/pair/99MjDDtQzNxo11yNTL71bQCubNGCePncN8zWYrDBSH9t",
    source: "static",
  },
  {
    address: "8EUkm5ChdmLm9pxKX3Q99APck1URfVqP9m9R3FQcP6Tb",
    name: "Xenium",
    symbol: "XNM",
    priceUsd: 0.00066,
    priceChange24h: -1.48,
    volume24h: 229.5,
    liquidity: 3870,
    marketCap: 336710,
    logo: "https://explorer.xenblocks.io/tokens/xnm.png",
    pairUrl: "https://x1.ninja/pair/8EUkm5ChdmLm9pxKX3Q99APck1URfVqP9m9R3FQcP6Tb",
    source: "static",
  },
  {
    address: "5J4hECH58eYQzuxpfrDyBrNr83G6Q7eMSbBhiymj8S3K",
    name: "Theo Prime AI",
    symbol: "THEO",
    priceUsd: 133.01,
    priceChange24h: null,
    volume24h: 0,
    liquidity: 2230,
    marketCap: 6650,
    logo: "https://gptree.vip/token-profiles/5aXz3n196NK41nSRiM9kS5NGCftmF7vn-logo-1770047076747-8fdaa3f7da52c7b7.webp",
    pairUrl: "https://x1.ninja/pair/5J4hECH58eYQzuxpfrDyBrNr83G6Q7eMSbBhiymj8S3K",
    source: "static",
  },
];

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
function fmt(n: number | null, prefix = "$"): string {
  if (n === null) return "—";
  if (n >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return `${prefix}${n.toFixed(3)}`;
  if (n >= 0.0001) return `${prefix}${n.toFixed(6)}`;
  return `${prefix}${n.toExponential(3)}`;
}

function fmtPct(n: number | null): string {
  if (n === null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

type X1ScrRaw = {
  xntUsd: number | null;
  tokens: Array<{
    mint: string;
    symbol: string;
    name: string;
    priceUsd: number | null;
    change24h: number | null;
    change1h: number | null;
    volume24hUsd: number | null;
    liquidityUsd: number | null;
    marketCapUsd: number | null;
    poolId: string | null;
  }>;
};

async function fetchX1Tokens(): Promise<{ tokens: X1Token[]; xntUsd: number | null; source: string; isSnapshot: boolean }> {
  try {
    const res = await fetch("/api/x1/tokens", {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`proxy returned ${res.status}`);
    const data = (await res.json()) as X1ScrRaw;

    const tokens: X1Token[] = (data.tokens ?? []).map((t) => ({
      address: t.mint ?? "",
      name: t.name ?? "Unknown",
      symbol: t.symbol ?? "?",
      priceUsd: t.priceUsd ?? null,
      priceChange24h: t.change24h ?? null,
      volume24h: t.volume24hUsd ?? null,
      liquidity: t.liquidityUsd ?? null,
      marketCap: t.marketCapUsd ?? null,
      logo: t.mint ? `/api/x1/logo?mint=${encodeURIComponent(t.mint)}` : undefined,
      pairUrl: t.poolId ? `https://x1scr.xyz/tokens/${t.mint}` : undefined,
      source: "x1scr" as const,
    }));

    return { tokens, xntUsd: data.xntUsd ?? null, source: "x1scr.xyz", isSnapshot: false };
  } catch {
    // Proxy down — show curated snapshot
    return { tokens: FEATURED_X1_TOKENS, xntUsd: null, source: "Featured (snapshot)", isSnapshot: true };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function X1TokenTracker() {
  const { data, isLoading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["x1-token-tracker"],
    queryFn: fetchX1Tokens,
    refetchInterval: 60_000,
    staleTime: 45_000,
    retry: 1,
  });

  const tokens = data?.tokens ?? [];
  const source = data?.source ?? "—";
  const isSnapshot = data?.isSnapshot ?? false;
  const hasData = tokens.length > 0;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-100">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <ChainIcon chain="x1" size={16} />
            <span className="text-[11px] font-bold text-pink-600 uppercase tracking-widest">
              X1 Token Tracker
            </span>
            <Flame className="w-3 h-3 text-pink-400" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLoading ? "bg-yellow-400" : isSnapshot ? "bg-orange-300" : hasData ? "bg-emerald-400" : "bg-gray-300"}`} />
          <span className="text-[10px] text-pink-400 font-semibold">
            {isLoading ? "Loading…" : hasData ? source : "Offline"}
          </span>
          {hasData && !isSnapshot ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-pink-300" />}
          <button onClick={() => refetch()} className="text-orange-300 hover:text-pink-500 transition-colors" title="Refresh">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
      {isSnapshot && (
        <div className="px-4 py-1.5 bg-pink-50/60 border-b border-orange-100 text-[10px] text-pink-500 font-semibold flex items-center justify-between">
          <span>Showing featured X1 projects — live API unavailable</span>
          <a href="https://x1scr.xyz" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-orange-700 underline">
            View live on x1scr.xyz
          </a>
        </div>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-5 text-[11px] font-mono border-b border-orange-50 bg-pink-50/40">
        <div className="col-span-2 px-3 py-1.5 text-pink-400 font-bold">TOKEN</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">PRICE</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">24H</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">VOL</div>
      </div>

      {/* Rows */}
      {isLoading ? (
        <div className="divide-y divide-orange-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 py-2.5 px-2 animate-pulse">
              <div className="col-span-2 flex items-center gap-2 pl-1">
                <div className="w-5 h-5 rounded-full bg-pink-100" />
                <div className="h-3 w-16 bg-pink-100 rounded" />
              </div>
              <div className="flex items-center justify-end pr-1"><div className="h-3 w-14 bg-pink-100 rounded" /></div>
              <div className="flex items-center justify-end pr-1"><div className="h-3 w-10 bg-pink-100 rounded" /></div>
              <div className="flex items-center justify-end pr-1"><div className="h-3 w-12 bg-pink-100 rounded" /></div>
            </div>
          ))}
        </div>
      ) : hasData ? (
        <div className="divide-y divide-orange-50 max-h-80 overflow-y-auto">
          {tokens.map((token, i) => {
            const up = (token.priceChange24h ?? 0) >= 0;
            return (
              <div
                key={`${token.address}-${i}`}
                className="grid grid-cols-5 text-xs font-mono py-2.5 px-2 hover:bg-pink-50/50 transition-colors group"
              >
                {/* Token */}
                <div className="col-span-2 flex items-center space-x-2 min-w-0 pl-1">
                  {token.logo ? (
                    <img src={token.logo} alt={token.symbol} className="w-5 h-5 rounded-full shrink-0 object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shrink-0 flex items-center justify-center">
                      <span className="text-[7px] text-white font-bold">{token.symbol.slice(0, 2)}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-pink-900 text-[11px] truncate">{token.symbol}</div>
                    <div className="text-[9px] text-pink-400 truncate">{token.name}</div>
                  </div>
                  {token.pairUrl && (
                    <a href={token.pairUrl} target="_blank" rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-400 hover:text-pink-600 shrink-0">
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {/* Price */}
                <div className="flex items-center justify-end px-1">
                  <span className="text-pink-800 font-semibold text-[10px]">
                    {fmt(token.priceUsd)}
                  </span>
                </div>
                {/* 24h change */}
                <div className={`flex items-center justify-end px-1 text-[10px] font-bold ${token.priceChange24h === null ? "text-pink-300" : up ? "text-emerald-400" : "text-rose-500"}`}>
                  {token.priceChange24h !== null ? (
                    <>
                      {up ? <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />}
                      {fmtPct(token.priceChange24h)}
                    </>
                  ) : "—"}
                </div>
                {/* Volume */}
                <div className="flex items-center justify-end px-1">
                  <span className="text-[10px] text-pink-600/80">{fmt(token.volume24h)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-pink-50 border border-pink-200/60 flex items-center justify-center mx-auto mb-3">
            <BarChart2 className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-sm font-bold text-pink-800 mb-1">X1 token data unavailable</p>
          <p className="text-xs text-pink-400 mb-4">
            Visit x1scr.xyz directly for real-time data.
          </p>
          <a href="https://x1scr.xyz" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full transition-colors">
            <ChainIcon chain="x1" size={14} />
            Open x1scr.xyz
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Footer */}
      {hasData && (
        <div className="border-t border-orange-50 px-3 py-1.5 flex items-center justify-between bg-pink-50/30">
          <span className="text-[9px] text-pink-400">
            {isSnapshot
              ? "Snapshot data"
              : lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "X1 Blockchain"}
          </span>
          <a href="https://x1scr.xyz" target="_blank" rel="noopener noreferrer"
            className="text-[9px] text-pink-400 hover:text-pink-600 font-semibold flex items-center gap-0.5">
            x1scr.xyz <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        </div>
      )}
    </div>
  );
}
