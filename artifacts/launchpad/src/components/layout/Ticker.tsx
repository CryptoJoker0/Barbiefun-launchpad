import { mockTrades } from "@/lib/mock-data";
import { Link } from "wouter";

export default function Ticker() {
  return (
    <div className="bg-gradient-to-r from-pink-500 via-red-400 to-pink-500 border-b border-pink-300 overflow-hidden py-1.5 flex items-center text-xs font-mono">
      <div className="animate-marquee whitespace-nowrap flex items-center space-x-8">
        {[...mockTrades, ...mockTrades, ...mockTrades].map((trade, i) => (
          <div key={i} className="flex items-center space-x-2">
            <span className="text-pink-100 opacity-80">{trade.wallet}</span>
            <span className={trade.type === "buy" ? "text-white font-bold" : "text-red-100 font-bold"}>
              {trade.type === "buy" ? "▲ bought" : "▼ sold"}
            </span>
            <span className="font-bold text-white">
              {trade.amount.toLocaleString()} {trade.tokenId}
            </span>
            <span className="text-pink-100 opacity-70">for</span>
            <span className="text-yellow-200 font-bold">${(trade.price * trade.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
