import { Link } from "wouter";
import { Token, formatCurrency, formatPercent, getBondingProgress, isGraduated } from "@/lib/mock-data";
import { CheckCircle, TrendingUp, TrendingDown, GraduationCap, Zap } from "lucide-react";

function BondingBar({ token }: { token: Token }) {
  const pct = getBondingProgress(token);
  const graduated = isGraduated(token);

  const barColor = graduated
    ? "bg-gradient-to-r from-yellow-400 to-amber-500"
    : pct >= 75
    ? "bg-gradient-to-r from-orange-400 to-pink-500"
    : pct >= 40
    ? "bg-gradient-to-r from-pink-400 to-pink-500"
    : "bg-gradient-to-r from-pink-300 to-rose-400";

  return (
    <div className="mt-3.5 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-semibold">
        {graduated ? (
          <span className="flex items-center space-x-1 text-amber-600">
            <GraduationCap className="w-3 h-3" />
            <span>Graduated to DEX 🎓</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-pink-500">
            <Zap className="w-3 h-3" />
            <span>Bonding curve</span>
          </span>
        )}
        <span className={graduated ? "text-amber-600 font-bold" : pct >= 75 ? "text-orange-500 font-bold" : "text-pink-400"}>
          {graduated ? "100%" : `${pct.toFixed(1)}%`}
        </span>
      </div>

      {/* Progress track */}
      <div className="relative h-2 w-full rounded-full bg-pink-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor} ${graduated ? "" : "relative"}`}
          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
        >
          {/* animated shimmer on active tokens */}
          {!graduated && pct > 5 && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          )}
        </div>
        {/* graduation milestone tick at 100% */}
        <div className="absolute right-0 top-0 h-full w-0.5 bg-amber-400/60" />
      </div>

      {/* Label row */}
      <div className="flex justify-between text-[10px] text-pink-300 font-mono">
        <span>{formatCurrency(token.bondingRaised)} raised</span>
        <span>Target {formatCurrency(token.graduationTarget)}</span>
      </div>
    </div>
  );
}

export default function TokenCard({ token }: { token: Token }) {
  const isPositive = token.priceChange24h >= 0;
  const graduated = isGraduated(token);
  const pct = getBondingProgress(token);

  return (
    <Link href={`/token/${token.id}`}>
      <div className={`
        relative group cursor-pointer rounded-2xl border bg-white overflow-hidden
        transition-all duration-300 hover:-translate-y-0.5
        hover:shadow-lg
        ${graduated
          ? "border-amber-200 hover:border-amber-400 hover:shadow-amber-100"
          : pct >= 75
          ? "border-orange-100 hover:border-orange-300 hover:shadow-pink-100"
          : "border-pink-100 hover:border-pink-300 hover:shadow-pink-100"}
      `}>
        {/* Graduated shimmer overlay */}
        {graduated && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-yellow-50/40 pointer-events-none" />
        )}

        {/* Graduated ribbon */}
        {graduated && (
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-yellow-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-xl tracking-wider">
            GRADUATED
          </div>
        )}

        {/* Near-graduation glow pulse */}
        {!graduated && pct >= 85 && (
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-400 to-pink-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-xl tracking-wider animate-pulse">
            🔥 CLOSE
          </div>
        )}

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-10 h-10 rounded-full border-2 shadow-sm shrink-0 ${graduated ? "border-amber-200" : "border-pink-100"}`}
                style={{ background: token.logo }}
              />
              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{token.name}</h3>
                  {token.isVerified && <CheckCircle className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                </div>
                <span className="text-[11px] font-mono text-pink-400 font-semibold">${token.ticker}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono text-sm font-bold text-gray-800">{formatCurrency(token.price)}</div>
              <div className={`flex items-center justify-end text-[11px] font-semibold mt-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {formatPercent(token.priceChange24h)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-[11px] mb-0.5">
            <div className="bg-pink-50 rounded-lg px-2.5 py-1.5">
              <div className="text-pink-300 font-semibold mb-0.5">MKT CAP</div>
              <div className="font-mono font-bold text-gray-700">{formatCurrency(token.marketCap)}</div>
            </div>
            <div className="bg-pink-50 rounded-lg px-2.5 py-1.5">
              <div className="text-pink-300 font-semibold mb-0.5">VOL 24H</div>
              <div className="font-mono font-bold text-gray-700">{formatCurrency(token.volume24h)}</div>
            </div>
          </div>

          {/* Bonding curve bar */}
          <BondingBar token={token} />
        </div>
      </div>
    </Link>
  );
}
