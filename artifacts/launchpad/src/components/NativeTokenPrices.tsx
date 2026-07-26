/**
 * NativeTokenPrices — replaces the LiveTerminal in the hero section.
 * Shows live USD prices for every supported chain's native token,
 * auto-refreshing every 60 seconds from CoinGecko's free API.
 */
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from "lucide-react";
import ChainIcon from "@/components/ChainIcon";
import { DISPLAY_CHAINS } from "@/lib/wagmi";

type PriceMap = Record<string, { usd: number; usd_24h_change: number }>;

const COINGECKO_IDS = ["binancecoin", "ethereum", "okb", "solana"];

async function fetchPrices(): Promise<PriceMap> {
  const ids = COINGECKO_IDS.join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  );
  if (!res.ok) throw new Error("Price fetch failed");
  return res.json();
}

async function fetchXntPrice(): Promise<number | null> {
  const res = await fetch("/api/x1/tokens", { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) return null;
  const data = await res.json() as { xntUsd?: number | null };
  return data.xntUsd ?? null;
}

function formatPrice(n: number): string {
  if (n >= 10000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 100) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(6)}`;
}

const STABLE_TOKENS = new Set(["USD", "USDC"]);

// Map each display chain to a CoinGecko ID
function cgId(symbol: string, coingeckoId?: string): string | null {
  if (coingeckoId) return coingeckoId;
  return null;
}

export default function NativeTokenPrices() {
  const { data: prices, isLoading, isError, dataUpdatedAt, refetch } = useQuery<PriceMap>({
    queryKey: ["native-token-prices"],
    queryFn: fetchPrices,
    refetchInterval: 60_000,
    staleTime: 45_000,
    retry: 2,
  });

  const { data: xntUsd } = useQuery<number | null>({
    queryKey: ["xnt-price"],
    queryFn: fetchXntPrice,
    refetchInterval: 60_000,
    staleTime: 45_000,
    retry: 1,
  });

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <div className="bg-white/80 backdrop-blur border border-pink-100 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-pink-500/10 to-transparent border-b border-pink-100">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest ml-1">
            Native Token Prices
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLoading ? "bg-yellow-400" : prices ? "bg-emerald-400" : "bg-gray-300"}`} />
          <span className="text-[10px] text-pink-400 font-semibold">
            {isLoading ? "Loading…" : isError ? "Offline" : "CoinGecko LIVE"}
          </span>
          {prices ? (
            <Wifi className="w-3 h-3 text-emerald-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-pink-300" />
          )}
          <button
            onClick={() => refetch()}
            className="text-pink-300 hover:text-pink-500 transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 text-[11px] font-mono border-b border-pink-50 bg-pink-50/40">
        <div className="col-span-2 px-3 py-1.5 text-pink-400 font-bold">CHAIN · TOKEN</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">PRICE</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">24H</div>
      </div>

      {/* Token rows */}
      <div className="divide-y divide-pink-50">
        {DISPLAY_CHAINS.map((chain) => {
          const isStable = STABLE_TOKENS.has(chain.symbol);
          const cid = cgId(chain.symbol, chain.coingeckoId);
          const priceData = cid ? prices?.[cid] : null;

          // X1 Blockchain (id -1) uses XNT price from x1scr.xyz proxy
          const isX1 = chain.id === -1;
          const price = isStable ? 1 : isX1 ? (xntUsd ?? null) : priceData?.usd ?? null;
          const change = isStable ? 0 : isX1 ? null : priceData?.usd_24h_change ?? null;
          const up = change === null ? true : change >= 0;

          return (
            <div
              key={chain.id}
              className="w-full grid grid-cols-4 text-xs font-mono py-2.5 px-2 hover:bg-pink-50/50 transition-colors"
            >
              {/* Chain + Token */}
              <div className="col-span-2 flex items-center space-x-2 min-w-0 pl-1">
                <ChainIcon chain={chain.icon} size={22} className="shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-pink-900 text-[11px] truncate flex items-center gap-1">
                    {chain.symbol}
                    {chain.isSvm && (
                      <span className="text-[8px] bg-purple-100 text-purple-600 rounded px-1 font-bold leading-none py-0.5">SVM</span>
                    )}
                  </div>
                  <div className="text-[9px] text-pink-400 truncate">{chain.name}</div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-end px-1">
                {isLoading && !price ? (
                  <span className="text-[10px] text-pink-300">—</span>
                ) : price !== null ? (
                  <span className="text-pink-800 font-semibold text-[10px]">
                    {isStable ? "$1.0000" : formatPrice(price)}
                  </span>
                ) : (
                  <span className="text-[10px] text-pink-300">—</span>
                )}
              </div>

              {/* 24h change */}
              <div className={`flex items-center justify-end px-1 text-[10px] font-bold ${
                isStable ? "text-pink-400" : up ? "text-emerald-400" : "text-rose-500"
              }`}>
                {isStable ? (
                  <span className="text-pink-400">stable</span>
                ) : change !== null ? (
                  <>
                    {up ? <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />}
                    {Math.abs(change).toFixed(2)}%
                  </>
                ) : (
                  <span className="text-pink-300">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-pink-50 px-3 py-1.5 flex items-center justify-between bg-pink-50/30">
        <span className="text-[9px] text-pink-400">
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Prices via CoinGecko"}
        </span>
        <span className="text-[9px] text-pink-400 font-mono">All chains · 8 tokens</span>
      </div>
    </div>
  );
}
