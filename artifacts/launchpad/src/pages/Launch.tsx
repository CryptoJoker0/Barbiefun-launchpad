import { useState } from "react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rocket, CheckCircle2, Upload, AlertCircle, Wallet, ExternalLink, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits, isAddress } from "viem";
import WalletModal from "@/components/WalletModal";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, X1_CHAIN_INFO } from "@/lib/wagmi";
import { useLaunchFeeNative, formatNativeAmount, LAUNCH_FEE_USD } from "@/lib/pricing";
import { addLaunch } from "@/lib/launches";

const CHAIN_EXPLORERS: Record<number, string> = {
  56: "https://bscscan.com/tx/",
  1: "https://etherscan.io/tx/",
  196: "https://www.okx.com/explorer/xlayer/tx/",
  4217: "https://explore.tempo.xyz/tx/",
  5042002: "https://testnet.arcscan.app/tx/",
  4663: "https://robinhoodchain.blockscout.com/tx/",
};

const TREASURY_ADDRESS = import.meta.env.VITE_LAUNCH_FEE_TREASURY_ADDRESS as string | undefined;

export default function Launch() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [walletOpen, setWalletOpen] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [successData, setSuccessData] = useState<{ ticker: string; txHash: string; chainId: number } | null>(null);
  const [formData, setFormData] = useState({ name: "", ticker: "", supply: "1000000000", description: "", website: "", twitter: "", telegram: "" });

  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();

  const selectedChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChainId);
  const fee = useLaunchFeeNative(selectedChain?.symbol ?? "", selectedChain?.isStableGas);

  const treasuryConfigured = !!TREASURY_ADDRESS && isAddress(TREASURY_ADDRESS);

  const handleChainSelect = (chainId: number) => {
    setSelectedChainId(chainId);
    if (isConnected && chain?.id !== chainId) {
      switchChain({ chainId });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) { setWalletOpen(true); return; }
    if (!selectedChain) return;
    if (chain?.id !== selectedChain.id) {
      switchChain({ chainId: selectedChain.id });
      return;
    }
    if (!treasuryConfigured || fee.native === null) return;

    try {
      const decimals = selectedChain.symbol === "USDC" ? 6 : 18;
      const value = selectedChain.isStableGas
        ? parseUnits(fee.native.toFixed(decimals), decimals)
        : parseEther(fee.native.toFixed(18));

      const txHash = await sendTransactionAsync({
        to: TREASURY_ADDRESS as `0x${string}`,
        value,
      });

      addLaunch({
        id: `${selectedChain.id}-${txHash}`,
        name: formData.name,
        ticker: formData.ticker || "TOKEN",
        description: formData.description,
        website: formData.website || undefined,
        twitter: formData.twitter || undefined,
        telegram: formData.telegram || undefined,
        totalSupply: formData.supply,
        chainId: selectedChain.id,
        chainName: selectedChain.name,
        deployer: address!,
        feeTxHash: txHash,
        createdAt: new Date().toISOString(),
      });

      setSuccessData({ ticker: formData.ticker || "TOKEN", txHash, chainId: selectedChain.id });
    } catch (err) {
      console.error("Launch fee payment failed", err);
    }
  };

  if (successData) {
    const explorerBase = CHAIN_EXPLORERS[successData.chainId];
    const successChain = SUPPORTED_CHAINS.find((c) => c.id === successData.chainId);
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-500">
        <Card className="border-pink-200 shadow-xl text-center py-12">
          <CardContent className="space-y-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Launch Fee Paid! 🎀</h2>
              <p className="text-pink-600 text-lg font-semibold">
                ${successData.ticker} launch request recorded on {successChain?.name}
              </p>
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl text-left">
                <Label className="text-pink-500 text-xs font-bold uppercase tracking-wide mb-2 block">Fee Transaction Hash</Label>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-pink-100">
                  <span className="font-mono text-xs text-gray-600 truncate">{successData.txHash}</span>
                  {explorerBase && (
                    <a href={`${explorerBase}${successData.txHash}`} target="_blank" rel="noopener noreferrer"
                      className="ml-2 shrink-0 text-pink-500 hover:text-pink-700">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Your $5 launch fee has been paid on-chain. Deploying the actual ERC-20 token contract requires a
                  factory contract per chain, which is the next production step — see the launch summary for details.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link href="/" className="flex-1 min-w-[140px]">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full">
                  Back to Terminal
                </Button>
              </Link>
              {successChain && (
                <a href={successChain.dex} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px]">
                  <Button variant="outline" className="w-full border-2 border-pink-300 text-pink-600 font-bold rounded-full">
                    Open DEX
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 pb-20 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-pink-500 to-red-400 bg-clip-text text-transparent">Launch Your Token</span>
        </h1>
        <p className="text-pink-600 font-medium">Fair launch, locked liquidity, zero team tokens.</p>
      </div>

      {!treasuryConfigured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-amber-700">
            Launch fee treasury address isn&apos;t configured yet. Set <code className="bg-amber-100 px-1 rounded">VITE_LAUNCH_FEE_TREASURY_ADDRESS</code> to enable real launches.
          </p>
        </div>
      )}

      {/* Wallet banner */}
      {!isConnected && (
        <div className="mb-6 bg-pink-50 border border-pink-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-pink-500 shrink-0" />
            <p className="text-sm font-semibold text-pink-700">Connect your wallet to pay the launch fee on-chain</p>
          </div>
          <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full shrink-0">
            Connect
          </Button>
        </div>
      )}

      {isConnected && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-700">Wallet connected</p>
              <p className="text-xs text-green-500 font-mono">{address?.slice(0, 12)}...{address?.slice(-6)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chain selection — required before anything else */}
      <Card className="border-pink-100 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold text-pink-600">1. Choose a Chain *</CardTitle>
          <CardDescription>Select which network to launch your token on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUPPORTED_CHAINS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleChainSelect(c.id)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                  selectedChainId === c.id
                    ? "border-pink-500 bg-pink-50 shadow-md"
                    : "border-pink-100 hover:border-pink-300"
                }`}
              >
                <ChainIcon chain={c.icon} size={28} />
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">{c.name}</span>
                {c.isTestnet && (
                  <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 rounded-full font-bold">TESTNET</span>
                )}
              </button>
            ))}
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 p-3 opacity-70">
              <ChainIcon chain="x1" size={28} />
              <span className="text-xs font-bold text-gray-500 text-center leading-tight">X1 Blockchain</span>
              <span className="text-[9px] text-gray-400 text-center leading-tight">Needs Solana wallet</span>
            </div>
          </div>
          {selectedChain && chain && chain.id !== selectedChain.id && isConnected && (
            <p className="mt-3 text-xs font-semibold text-amber-600">
              Your wallet is on a different network — you&apos;ll be prompted to switch to {selectedChain.name}.
            </p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={!selectedChain} className="disabled:opacity-50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-pink-600">2. Token Details</CardTitle>
              <CardDescription>Basic information about your token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-semibold text-gray-700 mb-1.5 block">Token Name *</Label>
                <Input id="name" name="name" placeholder="e.g. Barbie Coin" required
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-pink-200 focus:border-pink-400" />
              </div>
              <div>
                <Label htmlFor="ticker" className="font-semibold text-gray-700 mb-1.5 block">Ticker Symbol *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 font-bold">$</span>
                  <Input id="ticker" name="ticker" placeholder="BARBIE" required maxLength={10}
                    value={formData.ticker} onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    className="pl-7 border-pink-200 focus:border-pink-400 uppercase" />
                </div>
              </div>
              <div>
                <Label htmlFor="supply" className="font-semibold text-gray-700 mb-1.5 block">Total Supply</Label>
                <Input id="supply" name="supply" type="number" value={formData.supply}
                  onChange={(e) => setFormData({ ...formData, supply: e.target.value })}
                  className="border-pink-200 focus:border-pink-400" />
                <p className="text-xs text-pink-400 mt-1">All supply minted to your wallet on deploy</p>
              </div>
              <div>
                <Label htmlFor="description" className="font-semibold text-gray-700 mb-1.5 block">Description</Label>
                <Textarea id="description" name="description" placeholder="Tell the community about your token..."
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-pink-200 focus:border-pink-400 resize-none" rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-6">
            <Card className="border-pink-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-pink-600">Token Logo</CardTitle>
                <CardDescription>Upload a square image (PNG/SVG, max 2MB)</CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer hover:bg-pink-50 transition-colors">
                  <Upload className="w-8 h-8 text-pink-400 mb-2" />
                  <span className="text-sm font-semibold text-pink-500">Click to upload</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </CardContent>
            </Card>

            <Card className="border-pink-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-pink-600">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="font-semibold text-gray-700 mb-1.5 block">Website</Label>
                  <Input placeholder="https://yourtoken.com" value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="border-pink-200 focus:border-pink-400" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-700 mb-1.5 block">Twitter / X</Label>
                  <Input placeholder="https://x.com/yourtoken" value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="border-pink-200 focus:border-pink-400" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-700 mb-1.5 block">Telegram</Label>
                  <Input placeholder="https://t.me/yourtoken" value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    className="border-pink-200 focus:border-pink-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fee display */}
        {selectedChain && (
          <div className="mt-6 bg-white border-2 border-pink-200 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <ChainIcon chain={selectedChain.icon} size={32} />
              <div>
                <p className="text-xs uppercase tracking-wide font-bold text-pink-400">3. Launch Fee</p>
                <p className="text-2xl font-extrabold text-gray-800">
                  ${LAUNCH_FEE_USD.toFixed(2)}
                  <span className="text-base font-semibold text-pink-500 ml-2">
                    ≈ {fee.loading ? "…" : `${formatNativeAmount(fee.native)} ${selectedChain.symbol}`}
                  </span>
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${fee.isLive ? "bg-green-50 text-green-600 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
              {fee.isLive ? "● Live price" : "Est. price"}
            </span>
          </div>
        )}

        {/* Deploy info */}
        <div className="mt-6 bg-pink-50 border border-pink-200 rounded-2xl p-5 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
          <div className="text-sm text-pink-700">
            <strong className="block mb-1 text-pink-600 font-bold">Fair Launch — All launches on Barbie Fun are fair.</strong>
            100% of the initial supply mints to your wallet once your token contract is deployed. This step charges
            the ${LAUNCH_FEE_USD} launch fee on-chain and records your request; contract deployment uses a factory
            contract per chain (see the notes below).
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" size="lg" disabled={isSending || !selectedChain || !treasuryConfigured}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-extrabold text-lg h-14 rounded-full shadow-lg hover:shadow-pink-300/60 transition-all disabled:opacity-50">
            {isSending ? (
              <span className="flex items-center space-x-2">
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Confirming in wallet…</span>
              </span>
            ) : !selectedChain ? (
              <span>Select a chain to continue</span>
            ) : isConnected ? (
              <span className="flex items-center space-x-2"><Rocket className="w-5 h-5" /><span>Pay Launch Fee on {selectedChain.name}</span></span>
            ) : (
              <span className="flex items-center space-x-2"><Wallet className="w-5 h-5" /><span>Connect Wallet to Launch</span></span>
            )}
          </Button>
        </div>
        </fieldset>
      </form>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
