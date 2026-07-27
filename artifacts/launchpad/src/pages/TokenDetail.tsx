import { useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSupply } from "@/lib/launches";
import { useLaunchById, useLaunches } from "@/hooks/useLaunches";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import ChainIcon from "@/components/ChainIcon";
import {
  CheckCircle, ExternalLink, Copy, Clock, Info, Rocket,
  BadgeCheck, ShieldCheck, Share2, AlertTriangle, Search, TrendingUp,
} from "lucide-react";

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

/** DexScreener search URL per chain — universal DEX search by ticker */
const DEXSCREENER_CHAIN: Record<number, string> = {
  56:      "https://dexscreener.com/bsc",
  8453:    "https://dexscreener.com/base",
  196:     "https://dexscreener.com/xlayer",
  4217:    "https://dexscreener.com/tempo",
  5042002: "https://dexscreener.com/arc",
  4663:    "https://dexscreener.com/robinhoodchain",
  [-1]:    "https://dexscreener.com/x1",
  [-2]:    "https://dexscreener.com/solana",
};

export default function TokenDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const { data: launch, isLoading } = useLaunchById(id);
  const { data: allLaunches = [] } = useLaunches();

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-8 h-8 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-pink-400">Loading token…</p>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Info className="w-8 h-8 text-pink-200 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-pink-800 mb-2">Launch not found</h2>
        <p className="text-sm text-pink-400 mb-6">This token launch record doesn&apos;t exist or hasn&apos;t been confirmed yet.</p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-bold rounded-full">Back to Terminal</Button>
        </Link>
      </div>
    );
  }

  const chainMeta =
    SUPPORTED_CHAINS.find((c) => c.id === launch.chainId) ??
    DISPLAY_CHAINS.find((c) => c.id === launch.chainId);
  const explorerBase = CHAIN_EXPLORERS[launch.chainId];
  const explorerUrl = explorerBase ? `${explorerBase}${launch.feeTxHash}` : undefined;
  const dexScreenerBase = DEXSCREENER_CHAIN[launch.chainId];
  const dexSearchUrl = dexScreenerBase ? `${dexScreenerBase}?q=${encodeURIComponent(launch.ticker)}` : undefined;

  const isSvmChain = launch.chainId < 0;
  const deployerLaunches = allLaunches.filter(
    (l) => l.deployer === launch.deployer && l.id !== launch.id,
  );

  const copyDeployer = () => {
    navigator.clipboard.writeText(launch.deployer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToken = () => {
    const ogUrl = `${window.location.origin}/api/og/${launch.id}`;
    navigator.clipboard.writeText(ogUrl);
    setShareMsg("Share link copied!");
    setTimeout(() => setShareMsg(null), 2500);
  };

  const logoSrc = launch.logoUrl ? `/api/storage${launch.logoUrl}` : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-2 space-y-5">
        {/* Token header */}
        <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              {/* Logo */}
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={launch.ticker}
                  className="w-16 h-16 rounded-full border-2 border-pink-100 shadow-md shrink-0 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    (e.currentTarget.nextSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                  }}
                />
              ) : null}
              <div
                className="w-16 h-16 rounded-full border-2 border-pink-100 shadow-md shrink-0 bg-gradient-to-br from-pink-300 to-pink-400 items-center justify-center text-white font-black"
                style={{ display: logoSrc ? "none" : "flex" }}
              >
                {launch.ticker.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold">{launch.name}</h1>
                  <Badge className="font-mono text-xs border-pink-200/60 text-pink-600 bg-pink-50">${launch.ticker}</Badge>
                  {launch.verified && (
                    <Badge className="text-xs border-primary/30 text-primary bg-primary/10 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />Verified
                    </Badge>
                  )}
                </div>
                {chainMeta && (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-pink-600/80">
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
            <div className="font-mono font-bold text-base text-pink-900">{formatSupply(launch.totalSupply)}</div>
          </div>
          <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-pink-400 font-semibold mb-1">Chain</div>
            <div className="font-mono font-bold text-base text-pink-900">{chainMeta?.name ?? launch.chainName}</div>
          </div>
          <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-pink-400 font-semibold mb-1">Deployer</div>
            <button onClick={copyDeployer} className="flex items-center space-x-1 font-mono font-bold text-sm text-pink-900 hover:text-pink-600">
              <span>{launch.deployer.slice(0, 6)}…{launch.deployer.slice(-4)}</span>
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {launch.description && (
          <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-pink-900 mb-2">About {launch.name}</h3>
            <p className="text-sm text-pink-700">{launch.description}</p>
          </div>
        )}

        {(launch.website || launch.twitter || launch.telegram) && (
          <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm flex flex-wrap gap-3">
            {launch.website && (
              <a href={launch.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-pink-200/60 text-pink-600 rounded-full">Website</Button>
              </a>
            )}
            {launch.twitter && (
              <a href={launch.twitter} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-pink-200/60 text-pink-600 rounded-full">X / Twitter</Button>
              </a>
            )}
            {launch.telegram && (
              <a href={launch.telegram} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-pink-200/60 text-pink-600 rounded-full">Telegram</Button>
              </a>
            )}
          </div>
        )}

        {/* ── Explorer & DEX Links ─────────────────────────────────────── */}
        <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-pink-500" />
            <h3 className="font-extrabold text-pink-900 text-sm">Trade &amp; Explore</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dexSearchUrl && (
              <a href={dexSearchUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-pink-100 hover:border-pink-300 hover:bg-pink-50/50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                  <Search className="w-4 h-4 text-pink-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-pink-900">DexScreener</div>
                  <div className="text-[10px] text-pink-400 truncate">Search ${launch.ticker} on {chainMeta?.name ?? launch.chainName}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-pink-300 ml-auto shrink-0" />
              </a>
            )}
            {chainMeta?.dex && (
              <a href={chainMeta.dex} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-pink-100 hover:border-pink-300 hover:bg-pink-50/50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                  <ChainIcon chain={chainMeta.icon} size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-pink-900">{chainMeta.name} DEX</div>
                  <div className="text-[10px] text-pink-400 truncate">Trade on the native DEX</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-pink-300 ml-auto shrink-0" />
              </a>
            )}
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-pink-100 hover:border-pink-300 hover:bg-pink-50/50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                  <ExternalLink className="w-4 h-4 text-pink-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-pink-900">Block Explorer</div>
                  <div className="text-[10px] text-pink-400 truncate">View fee tx on {chainMeta?.name ?? launch.chainName}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-pink-300 ml-auto shrink-0" />
              </a>
            )}
          </div>
        </div>

        {/* ── OG Share Preview Card ───────────────────────────────────── */}
        <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-pink-500" />
              <h3 className="font-extrabold text-pink-900 text-sm">Share Preview</h3>
            </div>
            <span className="text-[10px] text-pink-400 font-semibold">How it looks on Twitter / Telegram</span>
          </div>
          {/* Mock social card */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-sm">
            <div className="bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 h-28 flex items-center justify-center relative">
              {logoSrc ? (
                <img src={logoSrc} alt={launch.ticker}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-pink-300 flex items-center justify-center text-white font-black text-xl">
                  {launch.ticker.slice(0, 2)}
                </div>
              )}
              <span className="absolute bottom-2 right-3 text-white/70 text-[10px] font-bold">barbie.fun</span>
            </div>
            <div className="p-3 bg-white">
              <div className="text-xs font-bold text-slate-800 leading-tight mb-0.5 truncate">
                ${launch.ticker} — {launch.name} | Barbie Fun
              </div>
              <div className="text-[10px] text-slate-500 line-clamp-2">
                {launch.description?.trim() || `${launch.name} launched on ${launch.chainName} via Barbie Fun. Fair launch, $5 fee.`}
              </div>
            </div>
          </div>
          <button
            onClick={shareToken}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {shareMsg ?? "Copy share link"}
          </button>
        </div>

        {/* Deployer History */}
        {deployerLaunches.length > 0 && (
          <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-pink-900 mb-3 text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4 text-pink-400" />
              Other launches by this deployer ({deployerLaunches.length})
            </h3>
            <div className="space-y-2">
              {deployerLaunches.slice(0, 5).map((l) => {
                const cm = SUPPORTED_CHAINS.find((c) => c.id === l.chainId) ?? DISPLAY_CHAINS.find((c) => c.id === l.chainId);
                return (
                  <Link key={l.id} href={`/token/${l.id}`}>
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl border border-pink-50 hover:border-pink-200 hover:bg-pink-50/40 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        {cm && <ChainIcon chain={cm.icon} size={14} />}
                        <span className="font-bold text-sm text-pink-900">${l.ticker}</span>
                        <span className="text-xs text-pink-400">{l.name}</span>
                      </div>
                      <span className="text-[10px] text-pink-300">{new Date(l.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar: fee & chain info + safety */}
      <div className="space-y-4">
        <div className="bg-white border border-pink-100 rounded-2xl shadow-sm overflow-hidden sticky top-20">
          <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 px-5 py-3">
            <h3 className="font-extrabold text-white text-lg">Launch Record</h3>
            {chainMeta && <p className="text-pink-100 text-xs flex items-center space-x-1"><ChainIcon chain={chainMeta.icon} size={12} /><span>{chainMeta.name}</span></p>}
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-pink-600/80 uppercase tracking-wide mb-1.5 block">Fee Transaction</label>
              <div className="flex items-center justify-between bg-pink-50 border border-pink-100 rounded-xl px-3 py-2.5">
                <span className="font-mono text-xs text-pink-700 truncate">{launch.feeTxHash}</span>
                {explorerUrl && (
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="ml-2 shrink-0 text-pink-500 hover:text-pink-700">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {chainMeta && (
              <a href={dexSearchUrl ?? chainMeta.dex} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-extrabold text-base h-12 rounded-xl">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {dexSearchUrl ? `Find $${launch.ticker}` : `Open ${chainMeta.name} DEX`}
                </Button>
              </a>
            )}

            <Link href="/launch">
              <Button variant="outline" className="w-full border-pink-200/60 text-pink-600 rounded-xl">
                <Rocket className="w-4 h-4 mr-2" />Launch Another Token
              </Button>
            </Link>

            <div className="text-center text-xs text-pink-300 pt-1">
              Fee payment verified on-chain — no fabricated data
            </div>
          </div>
        </div>

        {/* Token Safety card */}
        <div className="bg-white border border-pink-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-pink-100">
            <ShieldCheck className="w-4 h-4 text-pink-500" />
            <h3 className="font-extrabold text-pink-900 text-sm">Token Safety</h3>
            <span className="text-[10px] text-pink-400 ml-auto">Self-reported at launch</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              {
                label: "Mint Authority",
                safe: launch.mintAuthority === false,
                safeLabel: "Renounced",
                riskLabel: "Active",
                show: true,
              },
              {
                label: "Freeze Authority",
                safe: launch.freezeAuthority === false,
                safeLabel: "Disabled",
                riskLabel: "Active",
                show: isSvmChain,
              },
              { label: "Fair Launch", safe: true, safeLabel: "100% to creator", riskLabel: "", show: true },
              { label: "Fee Proof", safe: true, safeLabel: "On-chain tx", riskLabel: "", show: true },
            ]
              .filter((r) => r.show)
              .map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-700">{row.label}</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      row.safe
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-amber-50 text-amber-600 border-amber-200"
                    }`}
                  >
                    {row.safe ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {row.safe ? row.safeLabel : row.riskLabel}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
