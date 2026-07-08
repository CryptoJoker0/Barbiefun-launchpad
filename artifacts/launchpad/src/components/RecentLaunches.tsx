import { Link } from "wouter";
import { Rocket, Clock, ArrowRight, BadgeCheck } from "lucide-react";
import type { Launch } from "@/lib/launches";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RecentLaunches({ launches }: { launches: Launch[] }) {
  const recent = [...launches]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <section className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Rocket className="w-4 h-4 text-pink-500" />
          <span>Recently Launched Tokens</span>
        </h2>
        {recent.length > 0 && (
          <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-wide">Live</span>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No tokens launched yet — be the first to launch on Barbie Fun.
        </p>
      ) : (
        <div className="divide-y divide-pink-50">
          {recent.map((launch) => {
            const chainMeta =
              SUPPORTED_CHAINS.find((c) => c.id === launch.chainId) ??
              DISPLAY_CHAINS.find((c) => c.id === launch.chainId);
            return (
              <Link key={launch.id} href={`/token/${launch.id}`}>
                <div className="flex items-center justify-between py-3 group cursor-pointer">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-red-300 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                      {launch.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate flex items-center gap-1">
                        {launch.name}
                        {launch.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                        <span className="text-pink-400 font-mono font-semibold">${launch.ticker}</span>
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        {chainMeta && (
                          <span className="flex items-center gap-1">
                            <ChainIcon chain={chainMeta.icon} size={12} />
                            {chainMeta.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(launch.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pink-300 group-hover:text-pink-500 transition-colors shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
