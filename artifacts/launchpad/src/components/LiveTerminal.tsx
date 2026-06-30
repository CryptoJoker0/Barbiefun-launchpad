import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { mockTokens, mockTrades, formatCurrency, formatPercent, type Token } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateSparkline(token: Token, points = 40) {
  const data: { t: number; v: number }[] = [];
  let price = token.price * (1 - token.priceChange24h / 100);
  for (let i = 0; i < points; i++) {
    const change = (seededRand(token.price * i * 7.3 + i) - 0.48) * token.price * 0.04;
    price = Math.max(price + change, token.price * 0.1);
    data.push({ t: i, v: price });
  }
  data.push({ t: points, v: token.price });
  return data;
}

const TRENDING = [...mockTokens]
  .sort((a, b) => b.volume24h - a.volume24h)
  .slice(0, 5);

const SPARKLINES = Object.fromEntries(
  TRENDING.map((t) => [t.id, generateSparkline(t)])
);

function TerminalTrade({ trade, visible }: { trade: typeof mockTrades[0]; visible: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs font-mono transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"} ${trade.type === "buy" ? "bg-green-50" : "bg-red-50"}`}
    >
      <span className="text-gray-400 truncate w-24">{trade.wallet}</span>
      <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${trade.type === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
        {trade.type === "buy" ? "BUY" : "SELL"}
      </span>
      <span className="text-gray-700 font-semibold">{trade.amount.toLocaleString()} <span className="text-pink-500">{trade.tokenId}</span></span>
      <span className="text-gray-500">{formatCurrency(trade.price * trade.amount)}</span>
    </div>
  );
}

export default function LiveTerminal() {
  const [selected, setSelected] = useState<Token>(TRENDING[0]);
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(TRENDING.map((t) => [t.id, t.price]))
  );
  const [changes, setChanges] = useState<Record<string, "up" | "down" | "">>(
    Object.fromEntries(TRENDING.map((t) => [t.id, ""]))
  );
  const [trades, setTrades] = useState(mockTrades.slice(0, 6));
  const [tradeVisible, setTradeVisible] = useState(true);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      setPrices((prev) => {
        const next = { ...prev };
        const newChanges: Record<string, "up" | "down" | ""> = {};
        for (const token of TRENDING) {
          const noise = (seededRand(token.price * tickRef.current * 3.7 + tickRef.current) - 0.48) * token.price * 0.006;
          const updated = Math.max(prev[token.id] + noise, token.price * 0.5);
          newChanges[token.id] = updated > prev[token.id] ? "up" : "down";
          next[token.id] = updated;
        }
        setChanges(newChanges);
        setTimeout(() => setChanges(Object.fromEntries(TRENDING.map((t) => [t.id, ""]))), 600);
        return next;
      });

      if (tickRef.current % 4 === 0) {
        setTradeVisible(false);
        setTimeout(() => {
          setTrades((prev) => {
            const next = [...prev];
            const shifted = next.shift()!;
            next.push(shifted);
            return next;
          });
          setTradeVisible(true);
        }, 300);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const chartData = SPARKLINES[selected.id].map((d) => ({ ...d }));
  const isUp = selected.priceChange24h >= 0;

  return (
    <div className="w-full rounded-2xl border border-pink-200 bg-white shadow-xl overflow-hidden flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-pink-500 to-red-400">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm tracking-wide">LIVE TERMINAL</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300 animate-pulse" />
          <span className="text-pink-100 text-xs font-mono">LIVE</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-pink-100">
        {/* Left: trending list */}
        <div className="sm:w-56 shrink-0 p-3 space-y-1">
          <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2 px-1">Trending 🔥</p>
          {TRENDING.map((token) => {
            const live = prices[token.id];
            const flash = changes[token.id];
            const isSelected = selected.id === token.id;
            return (
              <button
                key={token.id}
                onClick={() => setSelected(token)}
                className={`w-full flex items-center justify-between px-2 py-2 rounded-xl text-left transition-all ${isSelected ? "bg-pink-50 border border-pink-200" : "hover:bg-pink-50/50"}`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full shrink-0 border border-pink-100"
                    style={{ background: token.logo }}
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-800 truncate">{token.ticker}</div>
                    <div className="text-[10px] text-gray-400 truncate">{token.name}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div
                    className={`text-xs font-mono font-bold transition-colors duration-300 ${
                      flash === "up" ? "text-green-500" : flash === "down" ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    {formatCurrency(live)}
                  </div>
                  <div className={`text-[10px] font-semibold ${token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercent(token.priceChange24h)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: chart + trades */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Selected token header */}
          <div className="px-4 pt-3 pb-1 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-full border border-pink-100"
                style={{ background: selected.logo }}
              />
              <div>
                <Link href={`/token/${selected.id}`}>
                  <span className="font-extrabold text-sm text-gray-800 hover:text-pink-500 transition-colors cursor-pointer">
                    {selected.name}
                  </span>
                </Link>
                <div className="text-[10px] text-gray-400 font-mono">${selected.ticker}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-base text-gray-800">{formatCurrency(prices[selected.id])}</div>
              <div className={`text-xs font-bold flex items-center justify-end space-x-0.5 ${isUp ? "text-green-500" : "text-red-500"}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{formatPercent(selected.priceChange24h)}</span>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="h-20 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="termGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={["dataMin", "dataMax"]} hide />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-white border border-pink-200 rounded-lg px-2 py-1 text-xs font-mono shadow-md text-gray-700">
                        {formatCurrency(payload[0].value as number)}
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={isUp ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fill="url(#termGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Live trades */}
          <div className="px-3 pb-3 space-y-1 border-t border-pink-50 pt-2">
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1.5">Recent Trades</p>
            {trades.slice(0, 4).map((trade, i) => (
              <TerminalTrade key={i} trade={trade} visible={tradeVisible} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
