import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { mockTokens, mockTrades, formatCurrency, formatPercent, type Token } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Zap, Wifi } from "lucide-react";
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

const MOCK_TRENDING = [...mockTokens].sort((a, b) => b.volume24h - a.volume24h).slice(0, 5);
const MOCK_SPARKLINES = Object.fromEntries(
  MOCK_TRENDING.map((t) => [t.id, generateSparkline(t.price, t.priceChange24h)])
);

type LiveItem = {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  volume: number;
  sparkline: { t: number; v: number }[];
  isLive: boolean;
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
    isLive: true,
    pairUrl: pair.url,
  };
}

function mockToLiveItem(t: Token): LiveItem {
  return {
    id: t.id,
    name: t.name,
    ticker: t.ticker,
    price: t.price,
    change: t.priceChange24h,
    volume: t.volume24h,
    sparkline: MOCK_SPARKLINES[t.id],
    isLive: false,
  };
}

export default function LiveTerminal() {
  const { data: bscPairs, isLoading } = useTopBscPairs();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [ticks, setTicks] = useState(0);

  const items: LiveItem[] = bscPairs && bscPairs.length > 0
    ? bscPairs.slice(0, 5).map(pairToLiveItem)
    : MOCK_TRENDING.map(mockToLiveItem);

  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  // Simulated price flicker every 2s
  useEffect(() => {
    const id = setInterval(() => {
      setTicks((t) => t + 1);
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
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest ml-1">
            Live Terminal
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-yellow-400" : bscPairs?.length ? "bg-green-400" : "bg-orange-400"} animate-pulse`} />
          <span className="text-[10px] text-pink-400 font-semibold">
            {bscPairs?.length ? "BSCScan LIVE" : isLoading ? "Connecting…" : "Mock data"}
          </span>
          {bscPairs?.length ? <Wifi className="w-3 h-3 text-green-500" /> : null}
        </div>
      </div>

      <div className="grid grid-cols-5 text-[11px] font-mono border-b border-pink-50 bg-pink-50/40">
        <div className="col-span-2 px-3 py-1.5 text-pink-400 font-bold">TOKEN</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">PRICE</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">24H</div>
        <div className="px-2 py-1.5 text-pink-400 font-bold text-right">CHART</div>
      </div>

      {/* Token rows */}
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
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-200 to-red-200 shrink-0 flex items-center justify-center text-[9px] font-black text-pink-600">
                  {item.ticker.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 truncate text-[11px]">{item.ticker}</div>
                  {item.isLive && <div className="text-[9px] text-green-500 font-bold">LIVE</div>}
                </div>
              </div>
              <div className="px-1 py-0 flex items-center justify-end">
                <span className="text-gray-700 font-semibold text-[10px]">
                  {livePrice < 0.001 ? livePrice.toExponential(2) : livePrice < 1 ? `$${livePrice.toFixed(6)}` : `$${livePrice.toFixed(4)}`}
                </span>
              </div>
              <div className={`flex items-center justify-end px-1 text-[10px] font-bold ${up ? "text-green-500" : "text-red-500"}`}>
                {up ? "▲" : "▼"} {Math.abs(item.change ?? 0).toFixed(1)}%
              </div>
              <div className="px-1">
                <ResponsiveContainer width="100%" height={28}>
                  <AreaChart data={item.sparkline}>
                    <defs>
                      <linearGradient id={`sg-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={up ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={up ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={["dataMin", "dataMax"]} hide />
                    <Area type="monotone" dataKey="v" stroke={up ? "#22c55e" : "#ef4444"}
                      strokeWidth={1.5} fill={`url(#sg-${item.id})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected token detail */}
      {selected && (
        <div className="border-t border-pink-100 p-3 bg-gradient-to-r from-pink-50/60 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-pink-500" />
              <span className="font-bold text-sm text-gray-800">${selected.ticker}</span>
              <span className="text-xs text-gray-400">{selected.name}</span>
              {selected.isLive && <span className="text-[9px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>}
            </div>
            <div className={`text-xs font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 inline mr-0.5" />}
              {formatPercent(selected.change ?? 0)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <div className="text-pink-400 font-semibold">PRICE</div>
              <div className="font-mono font-bold text-gray-800">
                {selected.price < 0.001 ? `$${selected.price.toExponential(3)}` : formatCurrency(getPrice(selected))}
              </div>
            </div>
            <div>
              <div className="text-pink-400 font-semibold">VOLUME 24H</div>
              <div className="font-mono font-bold text-gray-800">{formatCurrency(selected.volume)}</div>
            </div>
            <div>
              <div className="text-pink-400 font-semibold">CHAIN</div>
              <div className="font-mono font-bold text-gray-800">🟡 BSC</div>
            </div>
          </div>

          {/* Live trades feed (mock) */}
          <div className="mt-2 space-y-1">
            {mockTrades.slice(0, 3).map((trade, i) => (
              <div key={i}
                className={`flex items-center justify-between py-0.5 px-2 rounded text-[10px] font-mono ${trade.type === "buy" ? "bg-green-50" : "bg-red-50"}`}
              >
                <span className="text-gray-400 truncate w-20">{trade.wallet.slice(0, 8)}…</span>
                <span className={`font-bold ${trade.type === "buy" ? "text-green-600" : "text-red-600"}`}>{trade.type.toUpperCase()}</span>
                <span className="text-gray-600">{formatCurrency(trade.price * trade.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
