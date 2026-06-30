import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Token, formatCurrency, formatPercent } from "@/lib/mock-data";
import { CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

export default function TokenCard({ token }: { token: Token }) {
  const isPositive = token.priceChange24h >= 0;

  return (
    <Link href={`/token/${token.id}`}>
      <Card className="hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer bg-card/80 backdrop-blur-sm group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full border-2 border-border shadow-sm"
                style={{ background: token.logo }}
              />
              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="font-bold text-foreground leading-none">{token.name}</h3>
                  {token.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
                <span className="text-xs font-mono text-muted-foreground">${token.ticker}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">{formatCurrency(token.price)}</div>
              <div className={`flex items-center justify-end text-xs font-mono ${isPositive ? "text-primary" : "text-destructive"}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {formatPercent(token.priceChange24h)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-background/50 p-2 rounded-md">
              <div className="text-muted-foreground mb-1">Market Cap</div>
              <div className="font-mono font-medium">{formatCurrency(token.marketCap)}</div>
            </div>
            <div className="bg-background/50 p-2 rounded-md">
              <div className="text-muted-foreground mb-1">24h Vol</div>
              <div className="font-mono font-medium">{formatCurrency(token.volume24h)}</div>
            </div>
          </div>

          <div className="mt-4 h-1.5 w-full bg-background rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isPositive ? "bg-primary" : "bg-destructive"}`}
              style={{ width: `${Math.min(100, Math.max(5, Math.abs(token.priceChange24h)))}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
