import { useId, useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts";
import ChainIcon from "@/components/ChainIcon";
import { ChartContainer } from "@/components/ui/chart";

export type XntMarketData = {
  priceUsd: number | null;
  change24Pct: number | null;
  spark: number[];
  ts: number | null;
};

export type PricePoint = {
  time: number;
  price: number;
};

type CoinGeckoHistory = {
  prices?: [number, number][];
};

type NativePriceChartsProps = {
  xntMarket: XntMarketData | null;
  isXntLoading: boolean;
  isXntError: boolean;
  pulsePrice: { usd: number; usd_24h_change: number | null } | null;
  pulseHistory: PricePoint[];
  isPulseLoading: boolean;
  isPulseError: boolean;
  pulseHistoryUpdatedAt: number | null;
};

export async function fetchPulsechainHistory(): Promise<PricePoint[]> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/pulsechain/market_chart?vs_currency=usd&days=1",
    { signal: AbortSignal.timeout(10_000) },
  );

  if (!response.ok) throw new Error("PulseChain price history unavailable");

  const data = (await response.json()) as CoinGeckoHistory;
  return (data.prices ?? []).filter(
    ([time, price]) => Number.isFinite(time) && Number.isFinite(price) && price > 0,
  ).map(([time, price]) => ({ time, price }));
}

function downsample(points: PricePoint[], target = 60): PricePoint[] {
  if (points.length <= target) return points;
  return Array.from({ length: target }, (_, index) => {
    const sourceIndex = Math.round((index * (points.length - 1)) / (target - 1));
    return points[sourceIndex];
  });
}

function formatUsdPrice(value: number): string {
  if (value >= 1_000) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  if (value >= 1) return `$${value.toFixed(3)}`;
  if (value >= 0.01) return `$${value.toFixed(5)}`;
  if (value >= 0.0001) return `$${value.toFixed(7)}`;
  if (value >= 0.000001) return `$${value.toFixed(8)}`;
  return `$${value.toExponential(2)}`;
}

function formatUpdatedAt(timestamp: number | null): string {
  if (!timestamp) return "Waiting for feed";
  return `Updated ${new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

type PriceChartCardProps = {
  name: string;
  symbol: string;
  icon: string;
  source: string;
  price: number | null;
  change: number | null;
  history: PricePoint[];
  isLoading: boolean;
  isError: boolean;
  updatedAt: number | null;
  color: string;
};

function PriceChartCard({
  name,
  symbol,
  icon,
  source,
  price,
  change,
  history,
  isLoading,
  isError,
  updatedAt,
  color,
}: PriceChartCardProps) {
  const chartId = useId().replace(/:/g, "");
  const gradientId = `price-area-${chartId}`;
  const isPositive = change === null || change >= 0;

  return (
    <article className="min-w-0 rounded-xl border border-pink-100 bg-white/80 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <ChainIcon chain={icon} size={20} />
          <div className="min-w-0">
            <h4 className="truncate text-[11px] font-bold text-pink-900">{name}</h4>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-pink-400">{symbol} · 24H</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold leading-tight text-pink-900">
            {price !== null ? formatUsdPrice(price) : isLoading ? "Loading…" : "—"}
          </p>
          <p className={`mt-1 flex items-center justify-end gap-0.5 font-mono text-[10px] font-bold ${change === null ? "text-pink-300" : isPositive ? "text-emerald-600" : "text-rose-500"}`}>
            {change === null ? (
              "24h change unavailable"
            ) : (
              <>
                {isPositive ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
                {change > 0 ? "+" : ""}{change.toFixed(2)}%
              </>
            )}
          </p>
        </div>
      </div>

      {history.length > 1 ? (
        <ChartContainer
          config={{ price: { label: "Price", color } }}
          className="mt-2 h-[88px] w-full aspect-auto"
          role="img"
          aria-label={`${name} USD price trend over the last 24 hours`}
        >
          <AreaChart data={history} margin={{ top: 7, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-price)" stopOpacity={0.24} />
                <stop offset="100%" stopColor="var(--color-price)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis dataKey="price" domain={["dataMin", "dataMax"]} hide />
            <Tooltip
              cursor={{ stroke: color, strokeDasharray: "3 3", strokeOpacity: 0.3 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-md border border-pink-100 bg-white px-2 py-1 font-mono text-[10px] font-semibold text-pink-900 shadow-md">
                    {formatUsdPrice(Number(payload[0].value))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--color-price)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="mt-2 flex h-[88px] items-center justify-center rounded-lg border border-pink-50 bg-pink-50/40 px-3 text-center">
          <span className={`text-[10px] font-medium ${isLoading ? "animate-pulse text-pink-400" : "text-pink-400"}`}>
            {isLoading ? "Loading 24-hour chart…" : isError ? "Live chart unavailable right now" : "24-hour history unavailable"}
          </span>
        </div>
      )}

      <div className="mt-1 flex items-center justify-between text-[9px] text-pink-400">
        <span>{source} · 24H</span>
        <span>{formatUpdatedAt(updatedAt)}</span>
      </div>
    </article>
  );
}

export default function NativePriceCharts({
  xntMarket,
  isXntLoading,
  isXntError,
  pulsePrice,
  pulseHistory,
  isPulseLoading,
  isPulseError,
  pulseHistoryUpdatedAt,
}: NativePriceChartsProps) {
  const xntPoints = useMemo(
    () => (xntMarket?.spark ?? [])
      .filter((price) => Number.isFinite(price) && price > 0)
      .map((price, time) => ({ time, price })),
    [xntMarket?.spark],
  );
  const pulsePoints = useMemo(() => downsample(pulseHistory), [pulseHistory]);

  return (
    <section aria-labelledby="native-price-charts-title" className="border-t border-pink-100 bg-pink-50/30 px-3 pb-3">
      <div className="flex items-center justify-between gap-2 py-3">
        <div>
          <h3 id="native-price-charts-title" className="text-[11px] font-bold uppercase tracking-widest text-pink-600">
            X1 &amp; PulseChain charts
          </h3>
          <p className="mt-0.5 text-[9px] text-pink-400">Live native-asset prices · 24-hour trend</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
          Live
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <PriceChartCard
          name="X1 Blockchain"
          symbol="XNT"
          icon="x1"
          source="X1SCR"
          price={xntMarket?.priceUsd ?? null}
          change={xntMarket?.change24Pct ?? null}
          history={xntPoints}
          isLoading={isXntLoading}
          isError={isXntError}
          updatedAt={xntMarket?.ts ?? null}
          color="var(--color-chart-1)"
        />
        <PriceChartCard
          name="PulseChain"
          symbol="PLS"
          icon="pluschain"
          source="CoinGecko"
          price={pulsePrice?.usd ?? null}
          change={pulsePrice?.usd_24h_change ?? null}
          history={pulsePoints}
          isLoading={isPulseLoading}
          isError={isPulseError}
          updatedAt={pulseHistoryUpdatedAt || null}
          color="var(--color-chart-2)"
        />
      </div>
    </section>
  );
}
