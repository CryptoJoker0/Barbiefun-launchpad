import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BadgeCheck, ShieldAlert, CheckCircle2, Rocket, Zap, Wallet, ExternalLink, AlertCircle } from "lucide-react";
import { getLaunches, setLaunchVerified } from "@/lib/launches";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { useAccount, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther, parseUnits, isAddress } from "viem";
import WalletModal from "@/components/WalletModal";
import {
  useFeeNative,
  formatNativeAmount,
  verificationFeeUsd,
  VERIFICATION_FEE_STANDARD_USD,
  VERIFICATION_FEE_FAST_USD,
  type VerificationTier,
} from "@/lib/pricing";

const CHAIN_EXPLORERS: Record<number, string> = {
  56: "https://bscscan.com/tx/",
  1: "https://etherscan.io/tx/",
  196: "https://www.okx.com/explorer/xlayer/tx/",
  4217: "https://explore.tempo.xyz/tx/",
  5042002: "https://testnet.arcscan.app/tx/",
  4663: "https://robinhoodchain.blockscout.com/tx/",
};

const TREASURY_ADDRESS = import.meta.env.VITE_LAUNCH_FEE_TREASURY_ADDRESS as string | undefined;

export default function Verify() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();

  const [walletOpen, setWalletOpen] = useState(false);
  const [tier, setTier] = useState<VerificationTier>("standard");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [successData, setSuccessData] = useState<{ tier: VerificationTier; txHash: string; chainId: number } | null>(null);
  const [launches, setLaunches] = useState(getLaunches());

  const selectedChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChainId);
  const feeUsd = verificationFeeUsd(tier);
  const fee = useFeeNative(feeUsd, selectedChain?.symbol ?? "", selectedChain?.isStableGas);
  const treasuryConfigured = !!TREASURY_ADDRESS && isAddress(TREASURY_ADDRESS);

  const toggleVerified = (id: string, verified: boolean) => {
    setLaunchVerified(id, verified);
    setLaunches(getLaunches());
  };

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

      setSuccessData({ tier, txHash, chainId: selectedChain.id });
    } catch (err) {
      console.error("Verification fee payment failed", err);
    }
  };

  if (successData) {
    const explorerBase = CHAIN_EXPLORERS[successData.chainId];
    const successChain = SUPPORTED_CHAINS.find((c) => c.id === successData.chainId);
    const paidUsd = verificationFeeUsd(successData.tier);
    return (
      <div className="max-w-xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-500">
        <Card className="border-primary/50 text-center py-12 rounded-3xl shadow-lg">
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Application Submitted</h2>
              <p className="text-muted-foreground">
                Your ${paidUsd} {successData.tier === "fast" ? "fast-track" : "standard"} verification fee has been paid on{" "}
                {successChain?.name}. Our team will review your application {successData.tier === "fast" ? "within a few hours" : "within 24-48 hours"}.
                If approved, your token will receive the Verified badge.
              </p>
            </div>

            <div className="w-full bg-pink-50 border border-pink-200 p-4 rounded-2xl text-left">
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

            <Button variant="outline" onClick={() => setSuccessData(null)} className="mt-4 rounded-full">
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center">
          Get Verified <BadgeCheck className="w-8 h-8 ml-3 text-primary" />
        </h1>
        <p className="text-muted-foreground text-lg">
          Apply for the blue checkmark. Verified tokens stand out in the feed and build trust with the community.
        </p>
      </div>

      {!treasuryConfigured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-amber-700">
            Verification fee treasury address isn&apos;t configured yet. Set <code className="bg-amber-100 px-1 rounded">VITE_LAUNCH_FEE_TREASURY_ADDRESS</code> to enable real payments.
          </p>
        </div>
      )}

      {!isConnected && (
        <div className="mb-6 bg-pink-50 border border-pink-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-pink-500 shrink-0" />
            <p className="text-sm font-semibold text-pink-700">Connect your wallet to pay the verification fee on-chain</p>
          </div>
          <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full shrink-0">
            Connect
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="border-border rounded-3xl shadow-sm">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Verification Application</CardTitle>
                <CardDescription>Provide details about your project to prove legitimacy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Review Speed</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTier("standard")}
                      className={`text-left rounded-2xl border-2 p-4 transition-all ${
                        tier === "standard" ? "border-pink-500 bg-pink-50 shadow-md" : "border-border hover:border-pink-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">Standard</span>
                        <span className="font-extrabold text-lg text-pink-600">${VERIFICATION_FEE_STANDARD_USD}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Reviewed within 24-48 hours</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTier("fast")}
                      className={`text-left rounded-2xl border-2 p-4 transition-all ${
                        tier === "fast" ? "border-pink-500 bg-pink-50 shadow-md" : "border-border hover:border-pink-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" />Fast-Track</span>
                        <span className="font-extrabold text-lg text-pink-600">${VERIFICATION_FEE_FAST_USD}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Jumps the queue, reviewed within hours</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Pay Fee On</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {SUPPORTED_CHAINS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleChainSelect(c.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                          selectedChainId === c.id ? "border-pink-500 bg-pink-50 shadow-md" : "border-border hover:border-pink-300"
                        }`}
                      >
                        <ChainIcon chain={c.icon} size={24} />
                        <span className="text-xs font-bold text-gray-700 text-center leading-tight">{c.name}</span>
                      </button>
                    ))}
                  </div>
                  {selectedChain && chain && chain.id !== selectedChain.id && isConnected && (
                    <p className="text-xs font-semibold text-amber-600">
                      Your wallet is on a different network — you&apos;ll be prompted to switch to {selectedChain.name}.
                    </p>
                  )}
                  {selectedChain && (
                    <div className="bg-white border-2 border-pink-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center space-x-3">
                        <ChainIcon chain={selectedChain.icon} size={28} />
                        <div>
                          <p className="text-xs uppercase tracking-wide font-bold text-pink-400">Verification Fee</p>
                          <p className="text-xl font-extrabold text-gray-800">
                            ${feeUsd.toFixed(2)}
                            <span className="text-sm font-semibold text-pink-500 ml-2">
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
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Project Basics</h3>

                  <div className="space-y-2">
                    <Label htmlFor="address">Contract Address *</Label>
                    <Input id="address" placeholder="0x..." required className="font-mono" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input id="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website *</Label>
                      <Input id="website" type="url" placeholder="https://" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Social Presence</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter / X URL</Label>
                      <Input id="twitter" type="url" placeholder="https://x.com/Amanchain50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram Group</Label>
                      <Input id="telegram" type="url" placeholder="https://t.me/barbiefunv2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Trust & Security</h3>

                  <div className="space-y-2">
                    <Label htmlFor="audit">Audit Link (Optional but recommended)</Label>
                    <Input id="audit" type="url" placeholder="Link to Certik, Hacken, etc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">Why should we verify you? *</Label>
                    <Textarea
                      id="details"
                      placeholder="Tell us about the team, locked liquidity, utility, etc."
                      required
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-muted/10 border-t border-border mt-6 pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSending || !selectedChain || !treasuryConfigured}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-extrabold text-base h-12 rounded-full shadow-md hover:shadow-pink-300/50 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Confirming in wallet…</span>
                    </span>
                  ) : !selectedChain ? (
                    <span>Select a chain to pay the fee</span>
                  ) : isConnected ? (
                    <span className="flex items-center justify-center space-x-2">
                      <BadgeCheck className="w-4 h-4" /><span>Pay ${feeUsd} & Submit Application</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2"><Wallet className="w-4 h-4" /><span>Connect Wallet to Continue</span></span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-primary" />
                Verification Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>Liquidity must be locked or burned</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>Contract source code verified on explorer</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>Active social media presence</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>No malicious functions in contract (honeypot, tax &gt; 10%)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviewer panel — no backend yet, so review decisions are applied
          directly to the local launch records that power the Verified
          badge shown across the app (TokenCard, TokenDetail, Home feed). */}
      <div className="mt-10">
        <Card className="border-border rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Review Queue
            </CardTitle>
            <CardDescription>
              Team-only: approve or revoke the Verified badge for tokens launched on Barbie Fun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {launches.length === 0 ? (
              <div className="text-center py-10">
                <Rocket className="w-8 h-8 text-pink-200 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No launches to review yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {launches.map((launch) => {
                  const chainMeta = SUPPORTED_CHAINS.find((c) => c.id === launch.chainId);
                  return (
                    <div
                      key={launch.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-muted/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-red-300 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                          {launch.ticker.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate flex items-center gap-1">
                            {launch.name}
                            {launch.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">${launch.ticker}</span>
                            {chainMeta && (
                              <span className="flex items-center gap-1">
                                <ChainIcon chain={chainMeta.icon} size={12} />{chainMeta.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={launch.verified ? "outline" : "default"}
                        className={launch.verified ? "rounded-full border-red-200 text-red-500 hover:bg-red-50" : "rounded-full bg-primary text-primary-foreground"}
                        onClick={() => toggleVerified(launch.id, !launch.verified)}
                      >
                        {launch.verified ? "Revoke" : "Approve"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
