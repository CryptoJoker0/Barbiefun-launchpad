import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TrendingUp, TrendingDown, Zap, Wifi, WifiOff } from "lucide-react";
import { useTopBscPairs, type DexPair } from "@/lib/dexscreener";

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateSparkline(basePrice: number, change: number, points = 40) {
  const data: { t: number; v: number }[] = [];
  let price = basePrice * (1 - change / 200);
  for (let i = 0; i < points; i++) {
    const delta = (seededRand(basePrice * i * 7.3 + i) - 0.48) * basePrice * 0.03 + (change / 100 / points) * basePrice;
    price = Math.max(price + delta, basePrice * 0.1);
    data.push({ t: i, v: price });
  }
  data.push({ t: points, v: basePrice });
  return data;
}

type LiveItem = {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  volume: number;
  sparkline: { t: number; v: number }[];
  pairUrl?: string;
};

function pairToLiveItem(pair: DexPair): LiveItem {
  const price = parseFloat(pair.priceUsd || pair.priceNative || "0");
  const change = pair.priceChange?.h24 ?? 0;
  return {
    id: pair.pairAddress,
    name: pair.baseToken.name,
    ticker: pair.baseToken.symbol,
    price,
    change,
    volume: pair.volume?.h24 ?? 0,
    sparkline: generateSparkline(price, change),
    pairUrl: pair.url,
  };
}

export default function LiveTerminal() {
  const { data: bscPairs, isLoading, isError } = useTopBscPairs();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const items: LiveItem[] = (bscPairs ?? []).slice(0, 5).map(pairToLiveItem);
  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          const drift = (Math.random() - 0.499) * item.price * 0.002;
          next[item.id] = (prev[item.id] ?? item.price) + drift;
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const getPrice = (item: LiveItem) => prices[item.id] ?? item.price;
  const isPositive = selected ? (selected.change ?? 0) >= 0 : true;

  return (
    <div className="bg-white/80 backdrop-blur border border-pink-100 rounded-2xl shadow-lg overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-pink-500/10 to-transparent border-b border-pink-100">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest ml-1">
            Live Terminal
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-yellow-400" : items.length ? "bg-emerald-400" : "bg-gray-300"} animate-pulse`} />
          <span className="text-[10px] text-pink-400 font-semibold">
            {items.length ? "DexScreener LIVE" : isLoading ? "Connecting…" : "No live data"}
          </span>
          {items.length ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-pink-300" />}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <Zap className="w-6 h-6 text-pink-200 mb-2" />
          <p className="text-xs text-pink-400 font-semibold">
            {isError ? "Live market feed unavailable right now" : isLoading ? "Loading live pairs…" : "No trending pairs yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 text-[11px] font-mono border-b border-pink-50 bg-pink-50/40">
            <div className="col-span-2 px-3 py-1.5 text-pink-400 font-bold">TOKEN</div>
            <div className="px-2 py-1.5 text-pink-400 font-bold text-right">PRICE</div>
            <div className="px-2 py-1.5 text-pink-400 font-bold text-right">24H</div>
            <div className="px-2 py-1.5 text-pink-400 font-bold text-right">CHART</div>
          </div>

          <div className="divide-y divide-pink-50">
            {items.map((item) => {
              const livePrice = getPrice(item);
              const up = (item.change ?? 0) >= 0;
              const isSelected = (selected?.id ?? items[0]?.id) === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full grid grid-cols-5 text-xs font-mono py-2 px-2 hover:bg-pink-50/60 transition-colors text-left ${isSelected ? "bg-pink-50/80 border-l-2 border-pink-400" : ""}`}
                >
                  <div className="col-span-2 flex items-center space-x-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 shrink-0 flex items-center justify-center text-[9px] font-black text-pink-600">
                      {item.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-pink-900 truncate text-[11px]">{item.ticker}</div>
                      <div className="text-[9px] text-emerald-400 font-bold">LIVE</div>
                    </div>
                  </div>
                  <div className="px-1 py-0 flex items-center justify-end">
                    <span className="text-pink-800 font-semibold text-[10px]">
                      {livePrice < 0.001 ? livePrice.toExponential(2) : livePrice < 1 ? `$${livePrice.toFixed(6)}` : `$${livePrice.toFixed(4)}`}
                    </span>
                  </div>
                  <div className={`flex items-center justify-end px-1 text-[10px] font-bold ${up ? "text-emerald-400" : "text-rose-500"}`}>
                    {up ? "▲" : "▼"} {Math.abs(item.change ?? 0).toFixed(1)}%
                  </div>
                  <div className="px-1">
                    <ResponsiveContainer width="100%" height={28}>
                      <AreaChart data={item.sparkline}>
                        <defs>
                          <linearGradient id={`sg-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={up ? "#22c55e" : "#f43f5e"} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={up ? "#22c55e" : "#f43f5e"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <YAxis domain={["dataMin", "dataMax"]} hide />
                        <Area type="monotone" dataKey="v" stroke={up ? "#22c55e" : "#f43f5e"}
                          strokeWidth={1.5} fill={`url(#sg-${item.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="border-t border-pink-100 p-3 bg-gradient-to-r from-pink-50/60 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-pink-500" />
                  <span className="font-bold text-sm text-pink-900">${selected.ticker}</span>
                  <span className="text-xs text-pink-400">{selected.name}</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-500 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
                </div>
                <div className={`text-xs font-bold ${isPositive ? "text-emerald-400" : "text-rose-500"}`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 inline mr-0.5" />}
                  {formatPercent(selected.change ?? 0)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <div className="text-pink-400 font-semibold">PRICE</div>
                  <div className="font-mono font-bold text-pink-900">
                    {selected.price < 0.001 ? `$${selected.price.toExponential(3)}` : formatCurrency(getPrice(selected))}
                  </div>
                </div>
                <div>
                  <div className="text-pink-400 font-semibold">VOLUME 24H</div>
                  <div className="font-mono font-bold text-pink-900">{formatCurrency(selected.volume)}</div>
                </div>
                <div>
                  <div className="text-pink-400 font-semibold">CHAIN</div>
                  <div className="font-mono font-bold text-pink-900">BSC</div>
                </div>
              </div>
              {selected.pairUrl && (
                <a href={selected.pairUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-2 block text-center text-[10px] font-bold text-pink-500 hover:text-pink-600">
                  View live chart on DexScreener →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
