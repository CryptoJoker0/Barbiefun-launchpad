import { Link } from "wouter";
import type { Launch } from "@/lib/launches";
import { formatSupply } from "@/lib/launches";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { ExternalLink, Clock } from "lucide-react";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TokenCard({ launch }: { launch: Launch }) {
  const chainMeta = SUPPORTED_CHAINS.find((c) => c.id === launch.chainId);

  return (
    <Link href={`/token/${launch.id}`}>
      <div className="relative group cursor-pointer rounded-2xl border border-pink-100 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-pink-300 hover:shadow-pink-100">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full border-2 border-pink-100 shadow-sm shrink-0 bg-gradient-to-br from-pink-300 to-red-300 flex items-center justify-center text-white font-black text-xs">
                {launch.ticker.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">{launch.name}</h3>
                <span className="text-[11px] font-mono text-pink-400 font-semibold">${launch.ticker}</span>
              </div>
            </div>
            {chainMeta && (
              <div className="flex items-center space-x-1 shrink-0 bg-pink-50 border border-pink-100 rounded-full px-2 py-1">
                <ChainIcon chain={chainMeta.icon} size={14} />
                <span className="text-[10px] font-bold text-gray-600">{chainMeta.symbol}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
            <div className="bg-pink-50 rounded-lg px-2.5 py-1.5">
              <div className="text-pink-300 font-semibold mb-0.5">SUPPLY</div>
              <div className="font-mono font-bold text-gray-700">{formatSupply(launch.totalSupply)}</div>
            </div>
            <div className="bg-pink-50 rounded-lg px-2.5 py-1.5">
              <div className="text-pink-300 font-semibold mb-0.5">DEPLOYER</div>
              <div className="font-mono font-bold text-gray-700 truncate">{launch.deployer.slice(0, 6)}…{launch.deployer.slice(-4)}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-pink-300 font-mono">
            <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{timeAgo(launch.createdAt)}</span></span>
            <span className="flex items-center space-x-1 text-pink-400 group-hover:text-pink-600 transition-colors">
              <span>View details</span><ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
