import { getLaunches } from "@/lib/launches";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

const ANNOUNCEMENTS = [
  "🚀 Launch your token for a flat $5 across 6 EVM chains",
  "🌉 Bridge assets with Robinhood Bridge & X1 Bridge",
  `⛓️ Live on ${SUPPORTED_CHAINS.map((c) => c.name).join(" · ")}`,
  "💕 Join the community on Telegram & X",
];

export default function Ticker() {
  const launches = getLaunches().slice(0, 10);

  const items = launches.length > 0
    ? launches.map((l) => {
        const chain = SUPPORTED_CHAINS.find((c) => c.id === l.chainId);
        return `🎉 $${l.ticker} launched on ${chain?.name ?? "chain"} by ${l.deployer.slice(0, 6)}…${l.deployer.slice(-4)}`;
      })
    : ANNOUNCEMENTS;

  const loop = [...items, ...items, ...items];

  return (
    <div className="bg-gradient-to-r from-pink-500 via-red-400 to-pink-500 border-b border-pink-300 overflow-hidden py-1.5 flex items-center text-xs font-mono">
      <div className="animate-marquee whitespace-nowrap flex items-center space-x-8">
        {loop.map((text, i) => (
          <span key={i} className="font-semibold text-white">{text}</span>
        ))}
      </div>
    </div>
  );
}
