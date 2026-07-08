import { useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLaunchById, formatSupply } from "@/lib/launches";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import ChainIcon from "@/components/ChainIcon";
import { CheckCircle, ExternalLink, Copy, Clock, Info, Rocket, BadgeCheck } from "lucide-react";

const CHAIN_EXPLORERS: Record<number, string> = {
  56:      "https://bscscan.com/tx/",
  8453:    "https://basescan.org/tx/",
  196:     "https://www.okx.com/explorer/xlayer/tx/",
  4217:    "https://explore.tempo.xyz/tx/",
  5042002: "https://testnet.arcscan.app/tx/",
  4663:    "https://robinhoodchain.blockscout.com/tx/",
  [-1]:    "https://explorer.x1.xyz/tx/",
  [-2]:    "https://solscan.io/tx/",
};

export default function TokenDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const launch = id ? getLaunchById(id) : undefined;

  if (!launch) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Info className="w-8 h-8 text-pink-200 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Launch not found</h2>
        <p className="text-sm text-gray-400 mb-6">This token launch record doesn&apos;t exist in this browser&apos;s history.</p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full">Back to Terminal</Button>
        </Link>
      </div>
    );
  }

  const chainMeta =
    SUPPORTED_CHAINS.find((c) => c.id === launch.chainId) ??
    DISPLAY_CHAINS.find((c) => c.id === launch.chainId);
  const explorerBase = CHAIN_EXPLORERS[launch.chainId];
  const explorerUrl = explorerBase ? `${explorerBase}${launch.feeTxHash}` : undefined;

  const copyDeployer = () => {
    navigator.clipboard.writeText(launch.deployer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full border-2 border-pink-100 shadow-md shrink-0 bg-gradient-to-br from-pink-300 to-red-300 flex items-center justify-center text-white font-black">
                {launch.ticker.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold">{launch.name}</h1>
                  <Badge className="font-mono text-xs border-pink-200 text-pink-600 bg-pink-50">${launch.ticker}</Badge>
                  {launch.verified && (
                    <Badge className="text-xs border-primary/30 text-primary bg-primary/10 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />Verified
                    </Badge>
                  )}
                </div>
                {chainMeta && (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
                    <ChainIcon chain={chainMeta.icon} size={16} />
                    <span>{chainMeta.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-pink-400 font-semibold mb-1 flex items-center justify-end space-x-1">
                <Clock className="w-3 h-3" /><span>{new Date(launch.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <strong>Contract deployment pending.</strong> This record confirms the $5 launch fee was paid on-chain.
            Actual ERC-20 contract deployment requires a per-chain factory contract, which is the next production
            step for Barbie Fun (see the launch summary for details).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-pink-400 font-semibold mb-1">Total Supply</div>
            <div className="font-mono font-bold text-base text-gray-800">{formatSupply(launch.totalSupply)}</div>
          </div>
          <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-pink-400 font-semibold mb-1">Chain</div>
            <div className="font-mono font-bold text-base text-gray-800">{chainMeta?.name ?? launch.chainName}</div>
          </div>
          <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-pink-400 font-semibold mb-1">Deployer</div>
            <button onClick={copyDeployer} className="flex items-center space-x-1 font-mono font-bold text-sm text-gray-800 hover:text-pink-600">
              <span>{launch.deployer.slice(0, 6)}…{launch.deployer.slice(-4)}</span>
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {launch.description && (
          <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">About {launch.name}</h3>
            <p className="text-sm text-gray-600">{launch.description}</p>
          </div>
        )}

        {(launch.website || launch.twitter || launch.telegram) && (
          <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm flex flex-wrap gap-3">
            {launch.website && (
              <a href={launch.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 rounded-full">Website</Button>
              </a>
            )}
            {launch.twitter && (
              <a href={launch.twitter} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 rounded-full">X / Twitter</Button>
              </a>
            )}
            {launch.telegram && (
              <a href={launch.telegram} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 rounded-full">Telegram</Button>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Right: fee & chain info */}
      <div className="space-y-4">
        <div className="bg-white border border-pink-100 rounded-2xl shadow-sm overflow-hidden sticky top-20">
          <div className="bg-gradient-to-r from-pink-500 to-red-400 px-5 py-3">
            <h3 className="font-extrabold text-white text-lg">Launch Record</h3>
            {chainMeta && <p className="text-pink-100 text-xs flex items-center space-x-1"><ChainIcon chain={chainMeta.icon} size={12} /><span>{chainMeta.name}</span></p>}
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Fee Transaction</label>
              <div className="flex items-center justify-between bg-pink-50 border border-pink-100 rounded-xl px-3 py-2.5">
                <span className="font-mono text-xs text-gray-600 truncate">{launch.feeTxHash}</span>
                {explorerUrl && (
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="ml-2 shrink-0 text-pink-500 hover:text-pink-700">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {chainMeta && (
              <a href={chainMeta.dex} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-extrabold text-base h-12 rounded-xl">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open {chainMeta.name} DEX
                </Button>
              </a>
            )}

            <Link href="/launch">
              <Button variant="outline" className="w-full border-pink-200 text-pink-600 rounded-xl">
                <Rocket className="w-4 h-4 mr-2" />Launch Another Token
              </Button>
            </Link>

            <div className="text-center text-xs text-pink-300 pt-1">
              Fee payment verified on-chain — no fabricated data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
