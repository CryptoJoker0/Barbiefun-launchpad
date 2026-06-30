import { mockTrades } from "@/lib/mock-data";
import { Link } from "wouter";

export default function Ticker() {
  return (
    <div className="bg-black border-b border-primary/20 overflow-hidden py-1.5 flex items-center text-xs font-mono">
      <div className="animate-marquee whitespace-nowrap flex items-center space-x-8">
        {[...mockTrades, ...mockTrades, ...mockTrades].map((trade, i) => (
          <div key={i} className="flex items-center space-x-2">
            <span className="text-muted-foreground">{trade.wallet}</span>
            <span className={trade.type === "buy" ? "text-primary" : "text-destructive"}>
              {trade.type === "buy" ? "bought" : "sold"}
            </span>
            <span className="font-bold text-foreground">
              {trade.amount.toLocaleString()} {trade.tokenId}
            </span>
            <span className="text-muted-foreground">for</span>
            <span className="text-primary">${(trade.price * trade.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
