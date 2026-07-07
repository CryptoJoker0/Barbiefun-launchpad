import type { LucideIcon } from "lucide-react";
import { Rocket, ArrowLeftRight, Link2, Heart, PartyPopper } from "lucide-react";
import { getLaunches } from "@/lib/launches";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";

type TickerItem = { icon: LucideIcon; text: string };

const evmCount = SUPPORTED_CHAINS.length;
const svmCount = DISPLAY_CHAINS.filter((c) => c.isSvm).length;

const ANNOUNCEMENTS: TickerItem[] = [
  { icon: Rocket, text: `Launch your token for a flat $5 across ${evmCount} EVM chains + ${svmCount} SVM chains` },
  { icon: ArrowLeftRight, text: "Bridge assets · Base Bridge · Solana · X1 Bridge · Robinhood Bridge" },
  { icon: Link2, text: `Live on ${SUPPORTED_CHAINS.map((c) => c.name).join(" · ")} · X1 Blockchain · Solana` },
  { icon: Heart, text: "Join the community on Telegram & X" },
];

export default function Ticker() {
  const launches = getLaunches().slice(0, 10);

  const items: TickerItem[] = launches.length > 0
    ? launches.map((l) => {
        const chain = SUPPORTED_CHAINS.find((c) => c.id === l.chainId);
        return {
          icon: PartyPopper,
          text: `$${l.ticker} launched on ${chain?.name ?? "chain"} by ${l.deployer.slice(0, 6)}…${l.deployer.slice(-4)}`,
        };
      })
    : ANNOUNCEMENTS;

  const loop = [...items, ...items, ...items];

  return (
    <div className="bg-gradient-to-r from-pink-500 via-red-400 to-pink-500 border-b border-pink-300 overflow-hidden py-1.5 flex items-center text-xs font-mono">
      <div className="animate-marquee whitespace-nowrap flex items-center space-x-8">
        {loop.map((item, i) => (
          <span key={i} className="font-semibold text-white flex items-center gap-1.5">
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
