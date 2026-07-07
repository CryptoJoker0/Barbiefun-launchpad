import { ArrowLeftRight, ExternalLink, ShieldCheck } from "lucide-react";
import ChainIcon from "@/components/ChainIcon";

const SWAPS = [
  {
    id: "bnb",
    name: "PancakeSwap",
    icon: "bnb",
    description: "Swap tokens instantly on BNB Chain using the leading BSC DEX.",
    chains: "BNB Smart Chain",
    url: "https://pancakeswap.finance/swap",
    accent: "from-[#F3BA2F]/15 to-amber-50",
    button: "bg-[#F3BA2F] hover:bg-[#e0a91f] text-gray-900",
  },
  {
    id: "base",
    name: "Uniswap · Base",
    icon: "base",
    description: "Swap tokens on Base using Uniswap — the leading DEX now live on Coinbase's L2.",
    chains: "Base (Ethereum L2)",
    url: "https://app.uniswap.org/swap?chain=base",
    accent: "from-[#0052FF]/15 to-blue-50",
    button: "bg-[#0052FF] hover:bg-[#0040cc]",
  },
  {
    id: "solana",
    name: "Jupiter · Solana",
    icon: "solana",
    description: "Best swap rates on Solana via Jupiter — the largest DEX aggregator in the ecosystem.",
    chains: "Solana",
    url: "https://jup.ag",
    accent: "from-purple-500/15 to-purple-50",
    button: "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900",
  },
  {
    id: "xlayer",
    name: "OKX DEX",
    icon: "xlayer",
    description: "Swap tokens natively on X Layer using OKX's built-in decentralized exchange.",
    chains: "X Layer",
    url: "https://www.okx.com/web3/dex-swap",
    accent: "from-gray-900/10 to-gray-50",
    button: "bg-gray-900 hover:bg-gray-800",
  },
  {
    id: "x1",
    name: "X1 Swap",
    icon: "x1",
    description: "Swap SVM-based assets on the X1 blockchain.",
    chains: "X1 Blockchain (SVM)",
    url: "https://app.bridge.x1.xyz/",
    accent: "from-orange-500/15 to-orange-50",
    button: "bg-orange-500 hover:bg-orange-600",
  },
  {
    id: "robinhood",
    name: "Robinhood Chain Swap",
    icon: "robinhood",
    description: "Trade tokens directly on Robinhood Chain via its native swap interface.",
    chains: "Robinhood Chain",
    url: "https://relay.link/bridge",
    accent: "from-[#00C805]/15 to-emerald-50",
    button: "bg-[#00C805] hover:bg-[#00b304]",
  },
  {
    id: "tempo",
    name: "Tempo Swap",
    icon: "tempo",
    description: "Swap tokens on the Tempo network using its native exchange.",
    chains: "Tempo",
    url: "https://tempo.xyz/",
    accent: "from-violet-500/15 to-violet-50",
    button: "bg-violet-600 hover:bg-violet-700",
  },
];

export default function Swap() {
  return (
    <div className="max-w-4xl mx-auto py-8 pb-20 animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-red-400 shadow-lg shadow-pink-200 mb-4">
          <ArrowLeftRight className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-pink-500 to-red-400 bg-clip-text text-transparent">Swap Tokens</span>
        </h1>
        <p className="text-pink-600 font-medium max-w-xl mx-auto">
          Already have a token and just want to trade? Jump straight to a trusted DEX on your chain.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SWAPS.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="group">
            <div className={`relative h-full rounded-3xl border border-pink-100 bg-gradient-to-br ${s.accent} p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
              <div className="flex items-start justify-between mb-5">
                <ChainIcon chain={s.icon} size={48} />
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-1.5">{s.name}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{s.description}</p>
              <p className="text-xs font-mono text-gray-400 mb-6">{s.chains}</p>
              <div className={`w-full text-center text-white font-bold py-3 rounded-full shadow-md group-hover:shadow-lg transition-all ${s.button}`}>
                Open Swap
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 flex items-start space-x-3 bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Barbie Fun links directly to each DEX&apos;s official site — we never custody funds during a swap.
          Always confirm the URL bar shows the official domain before connecting your wallet.
        </p>
      </div>
    </div>
  );
}
