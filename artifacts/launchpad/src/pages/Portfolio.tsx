import { useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { motion } from "framer-motion";
import { Wallet, LogOut, Copy, CheckCircle2, ExternalLink, Rocket, BarChart3, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletModal from "@/components/WalletModal";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import { formatSupply } from "@/lib/launches";
import { formatNativeAmount } from "@/lib/pricing";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useLaunches } from "@/hooks/useLaunches";

function ChainBalance({ chainMeta }: { chainMeta: typeof SUPPORTED_CHAINS[0] }) {
  const { address } = useAccount();
  const { data: balance, isLoading, refetch } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: chainMeta.id,
  });

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-pink-100 bg-white hover:border-pink-200/60 transition-colors group">
      <div className="flex items-center space-x-3">
        <ChainIcon chain={chainMeta.icon} size={28} />
        <div>
          <p className="font-bold text-sm text-pink-900">{chainMeta.name}</p>
          <p className="text-xs text-pink-400">{chainMeta.symbol} · native token</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-right">
          {isLoading ? (
            <p className="text-sm font-mono text-pink-300 animate-pulse">Loading…</p>
          ) : balance ? (
            <>
              <p className="text-sm font-bold font-mono text-pink-900">
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </p>
            </>
          ) : (
            <p className="text-xs text-pink-400">Connect wallet</p>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-300 hover:text-pink-500"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const solana = useSolanaWallet();
  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: allLaunches = [] } = useLaunches();
  const myLaunches = allLaunches.filter(
    (l) => address && l.deployer.toLowerCase() === address.toLowerCase()
  );

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const shortSolAddress = solana.publicKey ? `${solana.publicKey.slice(0, 6)}…${solana.publicKey.slice(-4)}` : "";

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const anyConnected = isConnected || solana.connected;

  if (!anyConnected) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 shadow-lg shadow-pink-200 mb-6">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 bg-clip-text text-transparent">
          Your Portfolio
        </h1>
        <p className="text-pink-600/80 mb-8 max-w-sm mx-auto">
          Connect your wallet to view your token balances, holdings, and launch history across all supported chains.
        </p>
        <Button
          onClick={() => setWalletOpen(true)}
          className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-bold px-8 rounded-full"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
        {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 pb-20 animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-sm text-pink-400 mt-1">Your holdings across all supported chains</p>
        </div>
        <Button
          variant="outline"
          onClick={() => { disconnect(); solana.disconnect(); }}
          className="border-rose-200 text-rose-500 hover:bg-rose-50 rounded-full"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Disconnect
        </Button>
      </div>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isConnected && (
          <Card className="border-pink-200/60 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-pink-400 font-semibold uppercase tracking-wider">EVM Wallet</p>
                  <p className="font-mono font-bold text-pink-900 text-sm">{shortAddress}</p>
                </div>
              </div>
              {chain && (
                <div className="flex items-center gap-1.5 text-xs text-pink-500 font-semibold mb-3">
                  <ChainIcon chain={SUPPORTED_CHAINS.find((c) => c.id === chain.id)?.icon ?? "ethereum"} size={14} />
                  {chain.name}
                </div>
              )}
              <button
                onClick={() => copyAddress(address!)}
                className="flex items-center space-x-1.5 text-xs text-pink-400 hover:text-pink-600 font-semibold"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy address"}</span>
              </button>
            </CardContent>
          </Card>
        )}

        {solana.connected && (
          <Card className="border-purple-200 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                    {solana.walletId === "phantom" ? "Phantom" : "Backpack"} · SVM
                  </p>
                  <p className="font-mono font-bold text-pink-900 text-sm">{shortSolAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-500 font-semibold mb-3">
                <ChainIcon chain="x1" size={14} />
                X1 Blockchain · Solana
              </div>
              <button
                onClick={() => copyAddress(solana.publicKey!)}
                className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-600 font-semibold"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy address"}</span>
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chain balances */}
      {isConnected && (
        <Card className="border-pink-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-pink-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Native Token Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SUPPORTED_CHAINS.map((c) => (
              <ChainBalance key={c.id} chainMeta={c} />
            ))}
            {/* SVM chains */}
            {DISPLAY_CHAINS.filter((c) => c.isSvm).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 px-4 rounded-xl border border-dashed border-purple-200 bg-purple-50/30">
                <div className="flex items-center space-x-3">
                  <ChainIcon chain={c.icon} size={28} />
                  <div>
                    <p className="font-bold text-sm text-purple-700">{c.name}</p>
                    <p className="text-xs text-purple-400">{c.symbol} · SVM chain</p>
                  </div>
                </div>
                <div className="text-right">
                  {solana.connected ? (
                    <p className="text-xs text-purple-400 font-semibold">Use wallet UI</p>
                  ) : (
                    <p className="text-xs text-pink-400">Needs Phantom / Backpack</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* My launches */}
      <Card className="border-pink-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-pink-600 flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            My Token Launches
            <span className="ml-auto text-xs text-pink-400 font-normal">{myLaunches.length} total</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myLaunches.length === 0 ? (
            <div className="text-center py-10">
              <Rocket className="w-8 h-8 text-pink-200 mx-auto mb-3" />
              <p className="text-sm text-pink-600/80">No tokens launched yet from this wallet.</p>
              <a href="/launch" className="mt-3 inline-block text-sm font-bold text-pink-500 hover:text-pink-600">
                Launch your first token →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {myLaunches.map((launch) => {
                const chainMeta = SUPPORTED_CHAINS.find((c) => c.id === launch.chainId);
                return (
                  <motion.div
                    key={launch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between py-3 px-4 rounded-xl border border-pink-100 bg-white hover:border-pink-200/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {chainMeta && <ChainIcon chain={chainMeta.icon} size={22} />}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-pink-900">${launch.ticker}</p>
                          <p className="text-xs text-pink-400">{launch.name}</p>
                          {launch.verified && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-500 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>
                          )}
                        </div>
                        <p className="text-[10px] text-pink-400 font-mono">
                          {new Date(launch.createdAt).toLocaleDateString()} · Supply: {formatSupply(launch.totalSupply)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/token/${launch.id}`}
                      className="text-pink-400 hover:text-pink-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats summary */}
      {myLaunches.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tokens Launched", value: myLaunches.length },
            { label: "Fees Paid", value: `$${myLaunches.length * 5}` },
            { label: "Verified", value: myLaunches.filter((l) => l.verified).length },
          ].map((stat) => (
            <Card key={stat.label} className="border-pink-100 shadow-sm text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-extrabold text-pink-500">{stat.value}</p>
                <p className="text-xs text-pink-400 font-medium mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
