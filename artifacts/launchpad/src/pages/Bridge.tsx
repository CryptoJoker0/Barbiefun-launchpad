import { ArrowLeftRight, ExternalLink, ShieldCheck } from "lucide-react";
import ChainIcon from "@/components/ChainIcon";

const BRIDGES = [
  {
    id: "robinhood",
    name: "Robinhood Bridge",
    icon: "robinhood",
    description: "Bridge assets in and out of Robinhood Chain via Relay's cross-chain routing.",
    chains: "Ethereum, BSC, Arbitrum → Robinhood Chain",
    url: "https://relay.link/bridge",
    accent: "from-[#00C805]/15 to-emerald-50",
    button: "bg-[#00C805] hover:bg-[#00b304]",
  },
  {
    id: "x1",
    name: "X1 Bridge",
    icon: "x1",
    description: "Move assets between EVM chains and X1's SVM-based network.",
    chains: "Solana, Ethereum → X1 Blockchain",
    url: "https://app.bridge.x1.xyz/",
    accent: "from-orange-500/15 to-orange-50",
    button: "bg-orange-500 hover:bg-orange-600",
  },
];

export default function Bridge() {
  return (
    <div className="max-w-4xl mx-auto py-8 pb-20 animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-red-400 shadow-lg shadow-pink-200 mb-4">
          <ArrowLeftRight className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-pink-500 to-red-400 bg-clip-text text-transparent">Bridge Assets</span>
        </h1>
        <p className="text-pink-600 font-medium max-w-xl mx-auto">
          Move your tokens across chains using official bridge partners. Barbie Fun links out to
          each bridge&apos;s own secure interface — we never custody bridged funds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {BRIDGES.map((b) => (
          <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" className="group">
            <div className={`relative h-full rounded-3xl border border-pink-100 bg-gradient-to-br ${b.accent} p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
              <div className="flex items-start justify-between mb-5">
                <ChainIcon chain={b.icon} size={48} />
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-1.5">{b.name}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{b.description}</p>
              <p className="text-xs font-mono text-gray-400 mb-6">{b.chains}</p>
              <div className={`w-full text-center text-white font-bold py-3 rounded-full shadow-md group-hover:shadow-lg transition-all ${b.button}`}>
                Open Bridge
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 flex items-start space-x-3 bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Always verify you&apos;re on the official bridge domain before connecting a wallet or approving a
          transaction. Barbie Fun links directly to <span className="font-semibold">relay.link</span> and{" "}
          <span className="font-semibold">app.bridge.x1.xyz</span> — double-check the URL bar after the page loads.
        </p>
      </div>
    </div>
  );
}
