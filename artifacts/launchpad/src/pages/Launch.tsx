import { useState } from "react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rocket, CheckCircle2, Upload, AlertCircle, Wallet, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import WalletModal from "@/components/WalletModal";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

const CHAIN_EXPLORERS: Record<number, string> = {
  56: "https://bscscan.com/tx/",
  1: "https://etherscan.io/tx/",
  196: "https://www.okx.com/explorer/xlayer/tx/",
  1116: "https://scan.coredao.org/tx/",
};

export default function Launch() {
  const { address, isConnected, chain } = useAccount();
  const [walletOpen, setWalletOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ address: string; ticker: string; txHash: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", ticker: "", supply: "1000000000", description: "", website: "", twitter: "", telegram: "" });

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chain?.id) || SUPPORTED_CHAINS[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) { setWalletOpen(true); return; }
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 2200));

    const fakeHash = `0x${Array.from({ length: 64 }, (_, i) => ((i * 7 + address!.charCodeAt(i % address!.length) + 13) % 16).toString(16)).join("")}`;
    const fakeAddr = `0x${Array.from({ length: 40 }, (_, i) => ((i * 11 + 7) % 16).toString(16)).join("")}`;

    setSuccessData({ address: fakeAddr, ticker: formData.ticker || "BARBIE", txHash: fakeHash });
    setIsSubmitting(false);
  };

  if (successData) {
    const explorerBase = CHAIN_EXPLORERS[chain?.id ?? 56];
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
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Token Launched! 🎀</h2>
              <p className="text-pink-600 text-lg font-semibold">
                ${successData.ticker} is now live on {currentChain.name}
              </p>
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl text-left">
                <Label className="text-pink-500 text-xs font-bold uppercase tracking-wide mb-2 block">Contract Address</Label>
                <div className="font-mono text-sm text-gray-800 break-all select-all bg-white p-3 rounded-xl border border-pink-100">
                  {successData.address}
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl text-left">
                <Label className="text-pink-500 text-xs font-bold uppercase tracking-wide mb-2 block">Transaction Hash</Label>
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
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link href={`/token/${successData.ticker.toLowerCase()}`} className="flex-1 min-w-[140px]">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full">
                  View Token Page
                </Button>
              </Link>
              <a href={currentChain.dex} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px]">
                <Button variant="outline" className="w-full border-2 border-pink-300 text-pink-600 font-bold rounded-full">
                  Add Liquidity
                </Button>
              </a>
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

      {/* Wallet banner */}
      {!isConnected && (
        <div className="mb-6 bg-pink-50 border border-pink-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-pink-500 shrink-0" />
            <p className="text-sm font-semibold text-pink-700">Connect your wallet to deploy your token on-chain</p>
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
              <p className="text-xs text-green-500 font-mono">{address?.slice(0, 12)}...{address?.slice(-6)} on {currentChain.emoji} {currentChain.name}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-pink-600">Token Details</CardTitle>
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

        {/* Deploy info */}
        <div className="mt-6 bg-pink-50 border border-pink-200 rounded-2xl p-5 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
          <div className="text-sm text-pink-700">
            <strong className="block mb-1 text-pink-600 font-bold">Fair Launch — All launches on Barbie Fun are fair.</strong>
            100% of the initial supply will be minted to your wallet. Add liquidity on {currentChain.name} after launch.
            Estimated gas: ~0.003 {currentChain.symbol}.
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" size="lg" disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-extrabold text-lg h-14 rounded-full shadow-lg hover:shadow-pink-300/60 transition-all">
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Deploying to {currentChain.name}…</span>
              </span>
            ) : isConnected ? (
              <span className="flex items-center space-x-2"><Rocket className="w-5 h-5" /><span>Deploy Token on {currentChain.name}</span></span>
            ) : (
              <span className="flex items-center space-x-2"><Wallet className="w-5 h-5" /><span>Connect Wallet to Launch</span></span>
            )}
          </Button>
        </div>
      </form>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
