import { useState } from "react";
import { useParams } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTokens, mockTrades, formatCurrency, formatPercent } from "@/lib/mock-data";
import { CheckCircle, ArrowRightLeft, TrendingUp, TrendingDown, Clock, ShieldCheck, FileText, Globe, Twitter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const generateChartData = (basePrice: number) => {
  let currentPrice = basePrice;
  return Array.from({ length: 100 }).map((_, i) => {
    const change = (Math.sin(i * 0.3) * 0.02) + (Math.cos(i * 0.7) * 0.015) + (i % 7 === 0 ? 0.04 : -0.005);
    currentPrice = currentPrice * (1 + change);
    return { time: i, price: Math.max(currentPrice, basePrice * 0.3) };
  });
};

export default function TokenDetail() {
  const { id } = useParams();
  const token = mockTokens.find((t) => t.id === id) || mockTokens[0];
  const chartData = generateChartData(token.price);

  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");

  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-card border border-border rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div
              className="w-16 h-16 rounded-full border-2 border-border shadow-md shrink-0"
              style={{ background: token.logo }}
            />
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-3xl font-extrabold tracking-tight">{token.name}</h1>
                <Badge variant="outline" className="font-mono text-sm border-primary/30 text-primary bg-primary/5">
                  ${token.ticker}
                </Badge>
                {token.isVerified && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2 font-mono bg-background/50 px-3 py-1.5 rounded-md inline-flex border border-border/50">
                <span className="truncate max-w-[200px] sm:max-w-xs">{token.contractAddress}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-primary">
                  <FileText className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-left sm:text-right">
            <div className="text-3xl font-bold font-mono">{formatCurrency(token.price)}</div>
            <div className={`flex items-center sm:justify-end text-sm font-mono font-medium mt-1 ${isPositive ? "text-primary" : "text-destructive"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {formatPercent(token.priceChange24h)} (24h)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Market Cap", value: formatCurrency(token.marketCap) },
            { label: "24h Volume", value: formatCurrency(token.volume24h) },
            { label: "Holders", value: token.holders.toLocaleString() },
            { label: "Total Supply", value: formatCurrency(token.totalSupply).replace("$", "") },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className="font-mono font-bold text-lg">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="py-4 border-b border-border/50 bg-muted/10">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              Price History (7D)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis dataKey="time" hide />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={(val: number) => `$${val.toFixed(6)}`}
                  width={90}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  formatter={(value: number) => [`$${value.toFixed(6)}`, "Price"]}
                  labelFormatter={() => ""}
                />
                <ReferenceLine y={chartData[0].price} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-3">About {token.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{token.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="bg-background">
                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                Website
              </Button>
              <Button variant="outline" size="sm" className="bg-background">
                <Twitter className="w-4 h-4 mr-2 text-[#1DA1F2]" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="bg-background">
                <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                Contract Audit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border shadow-lg sticky top-20">
          <CardContent className="p-0">
            <Tabs value={tradeMode} onValueChange={(v) => setTradeMode(v as "buy" | "sell")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-xl bg-muted/30 p-0 h-14">
                <TabsTrigger
                  value="buy"
                  className="rounded-none rounded-tl-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-b-primary font-bold text-lg h-full"
                >
                  Buy
                </TabsTrigger>
                <TabsTrigger
                  value="sell"
                  className="rounded-none rounded-tr-xl data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:border-b-2 data-[state=active]:border-b-destructive font-bold text-lg h-full"
                >
                  Sell
                </TabsTrigger>
              </TabsList>

              <div className="p-6 space-y-6">
                <div className="bg-background/50 p-4 rounded-xl border border-border space-y-4 relative">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>You pay</span>
                      <span>Balance: 0.00 {tradeMode === "buy" ? "ETH" : token.ticker}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-2xl font-mono border-none bg-transparent shadow-none px-0 focus-visible:ring-0"
                      />
                      <div className="font-bold px-3 py-1 bg-card rounded-md border border-border shrink-0">
                        {tradeMode === "buy" ? "ETH" : token.ticker}
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center z-10">
                    <ArrowRightLeft className="w-4 h-4 text-muted-foreground rotate-90" />
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>You receive (est.)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-mono text-muted-foreground w-full">
                        {amount ? (Number(amount) * (tradeMode === "buy" ? 10000 : 0.0001)).toFixed(2) : "0.0"}
                      </div>
                      <div className="font-bold px-3 py-1 bg-card rounded-md border border-border shrink-0">
                        {tradeMode === "buy" ? token.ticker : "ETH"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Slippage Tolerance</span>
                    <span className="text-foreground">2.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Fee</span>
                    <span className="text-foreground">~$4.50</span>
                  </div>
                </div>

                <Button
                  className={`w-full font-bold text-lg h-14 ${tradeMode === "buy" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}
                >
                  {tradeMode === "buy" ? "Place Buy Order" : "Place Sell Order"}
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-4 border-b border-border/50 bg-muted/10">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Recent Trades
              </span>
              <Badge variant="outline" className="bg-background text-xs font-normal">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto divide-y divide-border/50">
              {mockTrades.slice(0, 15).map((trade, i) => (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-muted/5 transition-colors text-sm">
                  <div className="flex items-center space-x-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${trade.type === "buy" ? "bg-primary" : "bg-destructive"}`} />
                    <div className="font-mono text-xs text-muted-foreground">{trade.wallet}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold ${trade.type === "buy" ? "text-primary" : "text-destructive"}`}>
                      {trade.amount.toLocaleString()} {token.ticker}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(trade.price * trade.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
