import { useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTokens, formatCurrency, formatPercent } from "@/lib/mock-data";
import { CheckCircle, TrendingUp, TrendingDown, ExternalLink, Wallet, Copy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAccount } from "wagmi";
import { useTopBscPairs } from "@/lib/dexscreener";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import WalletModal from "@/components/WalletModal";

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const generateChartData = (basePrice: number) => {
  let price = basePrice;
  return Array.from({ length: 120 }).map((_, i) => {
    const swing = Math.sin(i * 0.25) * 0.018 + Math.cos(i * 0.6) * 0.012 + (seededRand(basePrice * i * 3.7) - 0.47) * 0.025;
    price = Math.max(price * (1 + swing), basePrice * 0.2);
    return { t: i, price };
  });
};

export default function TokenDetail() {
  const { id } = useParams();
  const token = mockTokens.find((t) => t.id === id) || mockTokens[0];
  const { isConnected, chain } = useAccount();
  const [walletOpen, setWalletOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [timeframe, setTimeframe] = useState("1D");
  const [copied, setCopied] = useState(false);

  const { data: bscPairs } = useTopBscPairs();
  const livePair = bscPairs?.find((p) =>
    p.baseToken.symbol.toLowerCase() === token.ticker.toLowerCase()
  );

  const livePrice = livePair?.priceUsd ? parseFloat(livePair.priceUsd) : token.price;
  const liveChange = livePair?.priceChange?.h24 ?? token.priceChange24h;
  const liveVolume = livePair?.volume?.h24 ?? token.volume24h;
  const liveMcap = livePair?.marketCap ?? token.marketCap;

  const chartData = generateChartData(livePrice);
  const isPositive = liveChange >= 0;

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chain?.id) || SUPPORTED_CHAINS[0];
  const dexUrl = `${currentChain.dex}?outputCurrency=${token.contractAddress}`;
  const explorerUrl = chain?.id === 56
    ? `https://bscscan.com/address/${token.contractAddress}`
    : `https://etherscan.io/address/${token.contractAddress}`;

  const copy = () => {
    navigator.clipboard.writeText(token.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const estimatedOut = amount
    ? (parseFloat(amount) / livePrice).toFixed(2)
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-20">
      {/* Left: Chart + info */}
      <div className="lg:col-span-2 space-y-5">
        {/* Token Header */}
        <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full border-2 border-pink-100 shadow-md shrink-0" style={{ background: token.logo }} />
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold">{token.name}</h1>
                  <Badge className="font-mono text-xs border-pink-200 text-pink-600 bg-pink-50">${token.ticker}</Badge>
                  {token.isVerified && <CheckCircle className="w-5 h-5 text-pink-500" />}
                  {livePair && <Badge className="text-[10px] bg-green-50 text-green-600 border-green-200">🔴 LIVE</Badge>}
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-100">
                  <span className="truncate max-w-[180px] sm:max-w-xs text-gray-600">{token.contractAddress}</span>
                  <button onClick={copy} className="text-pink-400 hover:text-pink-600">
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-600">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold font-mono">{formatCurrency(livePrice)}</div>
              <div className={`flex items-center justify-end text-sm font-semibold mt-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {formatPercent(liveChange)} 24h
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Market Cap", value: formatCurrency(liveMcap) },
            { label: "24h Volume", value: formatCurrency(liveVolume) },
            { label: "Holders", value: token.holders.toLocaleString() },
            { label: "Total Supply", value: "1B" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-pink-400 font-semibold mb-1">{s.label}</div>
              <div className="font-mono font-bold text-base text-gray-800">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Price Chart</h3>
            <div className="flex space-x-1">
              {["1H", "6H", "1D", "7D", "30D"].map((tf) => (
                <button key={tf} onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${timeframe === tf ? "bg-pink-500 text-white" : "text-pink-400 hover:bg-pink-50"}`}>
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-white border border-pink-200 rounded-lg px-3 py-1.5 text-xs font-mono shadow-md">
                      {formatCurrency(payload[0].value as number)}
                    </div>
                  ) : null
                }
              />
              <Area type="monotone" dataKey="price" stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2} fill="url(#colorGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* About */}
        <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">About {token.name}</h3>
          <p className="text-sm text-gray-600">{token.description}</p>
        </div>
      </div>

      {/* Right: Trade Panel */}
      <div className="space-y-4">
        <div className="bg-white border border-pink-100 rounded-2xl shadow-sm overflow-hidden sticky top-20">
          <div className="bg-gradient-to-r from-pink-500 to-red-400 px-5 py-3">
            <h3 className="font-extrabold text-white text-lg">Trade ${token.ticker}</h3>
            <p className="text-pink-100 text-xs">{currentChain.emoji} {currentChain.name}</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Buy / Sell tabs */}
            <div className="flex rounded-xl overflow-hidden border border-pink-100">
              <button onClick={() => setTradeMode("buy")}
                className={`flex-1 py-2.5 font-bold text-sm transition-all ${tradeMode === "buy" ? "bg-green-500 text-white" : "text-gray-500 hover:bg-pink-50"}`}>
                Buy
              </button>
              <button onClick={() => setTradeMode("sell")}
                className={`flex-1 py-2.5 font-bold text-sm transition-all ${tradeMode === "sell" ? "bg-red-500 text-white" : "text-gray-500 hover:bg-pink-50"}`}>
                Sell
              </button>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Amount ({tradeMode === "buy" ? currentChain.symbol : `$${token.ticker}`})
              </label>
              <div className="relative">
                <Input type="number" placeholder="0.00" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-pink-200 focus:border-pink-400 pr-16 text-lg font-mono" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-pink-400">
                  {tradeMode === "buy" ? currentChain.symbol : token.ticker}
                </span>
              </div>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-1.5">
              {["0.1", "0.5", "1", "5"].map((v) => (
                <button key={v} onClick={() => setAmount(v)}
                  className="py-1.5 rounded-lg text-xs font-bold border border-pink-200 text-pink-500 hover:bg-pink-50 transition-colors">
                  {v}
                </button>
              ))}
            </div>

            {/* Estimated output */}
            {estimatedOut && (
              <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-center">
                <p className="text-xs text-pink-400 font-semibold mb-0.5">You receive ~</p>
                <p className="font-mono font-bold text-gray-800">{estimatedOut} ${token.ticker}</p>
              </div>
            )}

            {/* Trade button */}
            {isConnected ? (
              <a href={dexUrl} target="_blank" rel="noopener noreferrer">
                <Button className={`w-full font-extrabold text-base h-12 rounded-xl ${tradeMode === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {tradeMode === "buy" ? "Buy" : "Sell"} on {tradeMode === "buy" && currentChain.id === 56 ? "PancakeSwap" : "DEX"}
                </Button>
              </a>
            ) : (
              <Button onClick={() => setWalletOpen(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-extrabold text-base h-12 rounded-xl">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet to Trade
              </Button>
            )}

            {/* Links */}
            <div className="flex gap-2 pt-1">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs border-pink-200 text-pink-500 rounded-lg">
                  <ExternalLink className="w-3 h-3 mr-1" />Explorer
                </Button>
              </a>
              <a href={dexUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs border-pink-200 text-pink-500 rounded-lg">
                  Chart
                </Button>
              </a>
            </div>

            <div className="text-center text-xs text-pink-300 pt-1">
              Price data powered by DexScreener
            </div>
          </div>
        </div>
      </div>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
