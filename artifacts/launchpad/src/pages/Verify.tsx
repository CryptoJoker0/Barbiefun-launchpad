import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  BadgeCheck, ShieldAlert, CheckCircle2, Zap,
  Wallet, ExternalLink, AlertCircle, Copy,
} from "lucide-react";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS, X1_CHAIN_INFO, SOLANA_CHAIN_INFO } from "@/lib/wagmi";
import { useAccount, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther, parseUnits, isAddress } from "viem";
import WalletModal from "@/components/WalletModal";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import {
  useFeeNative,
  formatNativeAmount,
  verificationFeeUsd,
  useNativeTokenPriceUsd,
  VERIFICATION_FEE_STANDARD_USD,
  VERIFICATION_FEE_FAST_USD,
  type VerificationTier,
} from "@/lib/pricing";
import { verifySvmPayment } from "@/lib/svmVerify";

// ---------------------------------------------------------------------------
// Chain explorer URLs
// ---------------------------------------------------------------------------
const EVM_EXPLORERS: Record<number, string> = {
  56:      "https://bscscan.com/tx/",
  8453:    "https://basescan.org/tx/",
  196:     "https://www.okx.com/explorer/xlayer/tx/",
  4217:    "https://explore.tempo.xyz/tx/",
  5042002: "https://testnet.arcscan.app/tx/",
  4663:    "https://robinhoodchain.blockscout.com/tx/",
};

// SVM treasury address — set VITE_SOLANA_TREASURY_ADDRESS for real SOL payments
const EVM_TREASURY   = import.meta.env.VITE_LAUNCH_FEE_TREASURY_ADDRESS as string | undefined;
const SOL_TREASURY   = import.meta.env.VITE_SOLANA_TREASURY_ADDRESS as string | undefined;

type SvmChainKey = "x1" | "solana";

const SVM_CHAINS: { key: SvmChainKey; name: string; icon: string; symbol: string; explorer: string }[] = [
  { key: "x1",     name: "X1 Blockchain", icon: "x1",     symbol: "XN",  explorer: "https://explorer.x1.xyz/tx/" },
  { key: "solana", name: "Solana",        icon: "solana", symbol: "SOL", explorer: "https://solscan.io/tx/" },
];

/**
 * Validate a base58-encoded SVM transaction signature.
 * Solana/X1 tx signatures are 64-byte Ed25519 values — base58 of 64 bytes
 * produces exactly 87 or 88 characters in the standard base58 alphabet.
 */
function isValidSvmSig(sig: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(sig.trim());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Verify() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();
  const solana = useSolanaWallet();

  const [walletOpen,     setWalletOpen]     = useState(false);
  const [tier,           setTier]           = useState<VerificationTier>("standard");
  const [selectedEvmId,  setSelectedEvmId]  = useState<number | null>(null);
  const [selectedSvm,    setSelectedSvm]    = useState<SvmChainKey | null>(null);
  const [svmTxSig,       setSvmTxSig]       = useState("");
  const [svmSubmitting,  setSvmSubmitting]  = useState(false);
  const [svmVerifyError, setSvmVerifyError] = useState<string | null>(null);
  const [successData,    setSuccessData]    = useState<{
    tier: VerificationTier;
    txHash: string;
    chainName: string;
    explorer: string;
  } | null>(null);
  const [copied,         setCopied]         = useState(false);

  // derived
  const selectedEvmChain = SUPPORTED_CHAINS.find((c) => c.id === selectedEvmId);
  const selectedSvmMeta  = SVM_CHAINS.find((c) => c.key === selectedSvm);
  const feeUsd = verificationFeeUsd(tier);
  const evmFee = useFeeNative(feeUsd, selectedEvmChain?.symbol ?? "", selectedEvmChain?.isStableGas);
  const solPriceQuery = useNativeTokenPriceUsd("SOL");
  const solFee = useFeeNative(feeUsd, "SOL");
  const treasuryConfigured = !!EVM_TREASURY && isAddress(EVM_TREASURY);
  const anySvmConnected = solana.connected;

  // EVM chain select
  const handleEvmChainSelect = (chainId: number) => {
    setSelectedEvmId(chainId);
    setSelectedSvm(null);
    if (isConnected && chain?.id !== chainId) switchChain({ chainId });
  };

  // SVM chain select
  const handleSvmSelect = (key: SvmChainKey) => {
    setSelectedSvm(key);
    setSelectedEvmId(null);
    setSvmTxSig("");
    setSvmVerifyError(null);
  };

  // EVM submit
  const handleEvmSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) { setWalletOpen(true); return; }
    if (!selectedEvmChain) return;
    if (chain?.id !== selectedEvmChain.id) { switchChain({ chainId: selectedEvmChain.id }); return; }
    if (!treasuryConfigured || evmFee.native === null) return;

    try {
      const decimals = selectedEvmChain.symbol === "USDC" ? 6 : 18;
      const value = selectedEvmChain.isStableGas
        ? parseUnits(evmFee.native.toFixed(decimals), decimals)
        : parseEther(evmFee.native.toFixed(18));

      const txHash = await sendTransactionAsync({ to: EVM_TREASURY as `0x${string}`, value });
      const explorerBase = EVM_EXPLORERS[selectedEvmChain.id] ?? "";
      setSuccessData({ tier, txHash, chainName: selectedEvmChain.name, explorer: explorerBase });
    } catch (err) {
      console.error("Verification fee payment failed", err);
    }
  };

  // SVM submit — real on-chain verification
  const handleSvmSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSvmMeta) return;
    if (!isValidSvmSig(svmTxSig)) return;
    if (!SOL_TREASURY) return;

    setSvmSubmitting(true);
    setSvmVerifyError(null);

    // Determine which RPC to call and how many lamports to expect.
    // For Solana we have a live SOL/USD price; for X1 (XN) we skip the
    // amount check since XN has no reliable public price feed.
    const rpcUrl =
      selectedSvm === "solana"
        ? SOLANA_CHAIN_INFO.rpc
        : X1_CHAIN_INFO.rpc;

    let minLamports = 0;
    if (selectedSvm === "solana") {
      const solPrice =
        solPriceQuery.data ??
        175; // static fallback — only used if CoinGecko is unreachable
      // Require at least 95 % of the expected amount (5 % slippage buffer)
      minLamports = Math.floor((feeUsd / solPrice) * 1e9 * 0.95);
    }

    const result = await verifySvmPayment(
      svmTxSig,
      rpcUrl,
      SOL_TREASURY,
      minLamports,
    );

    if (!result.ok) {
      setSvmVerifyError(result.message);
      setSvmSubmitting(false);
      return;
    }

    setSuccessData({
      tier,
      txHash: svmTxSig.trim(),
      chainName: selectedSvmMeta.name,
      explorer: selectedSvmMeta.explorer,
    });
    setSvmSubmitting(false);
  };

  // ---------------------------------------------------------------------------
  // Success screen
  // ---------------------------------------------------------------------------
  if (successData) {
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
                {successData.chainName}. Our team will review your application{" "}
                {successData.tier === "fast" ? "within a few hours" : "within 24-48 hours"}.
              </p>
            </div>
            <div className="w-full bg-pink-50 border border-pink-200/60 p-4 rounded-2xl text-left">
              <Label className="text-pink-500 text-xs font-bold uppercase tracking-wide mb-2 block">Fee Transaction Hash</Label>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-pink-100">
                <span className="font-mono text-xs text-pink-700 truncate">{successData.txHash}</span>
                {successData.explorer && (
                  <a href={`${successData.explorer}${successData.txHash}`} target="_blank" rel="noopener noreferrer"
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

  // ---------------------------------------------------------------------------
  // Main form
  // ---------------------------------------------------------------------------
  const isSvmSelected = !!selectedSvm;
  const isEvmSelected = !!selectedEvmChain;

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
            EVM treasury not configured. Set <code className="bg-amber-100 px-1 rounded">VITE_LAUNCH_FEE_TREASURY_ADDRESS</code> to enable real EVM payments.
          </p>
        </div>
      )}

      {/* SVM wallet banner */}
      {isSvmSelected && !anySvmConnected && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-purple-500 shrink-0" />
            <p className="text-sm font-semibold text-purple-700">
              Connect Phantom or Backpack to proceed with {selectedSvmMeta?.name} verification
            </p>
          </div>
          <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shrink-0">
            Connect SVM Wallet
          </Button>
        </div>
      )}

      {/* EVM wallet banner */}
      {isEvmSelected && !isConnected && (
        <div className="mb-6 bg-pink-50 border border-pink-200/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-pink-500 shrink-0" />
            <p className="text-sm font-semibold text-pink-700">Connect your EVM wallet to pay the verification fee on-chain</p>
          </div>
          <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white font-bold rounded-full shrink-0">
            Connect
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">

          {/* ── EVM form ── */}
          {(!isSvmSelected) && (
            <Card className="border-border rounded-3xl shadow-sm">
              <form onSubmit={handleEvmSubmit}>
                <CardHeader>
                  <CardTitle>Verification Application</CardTitle>
                  <CardDescription>Provide details about your project to prove legitimacy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tier */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-border/50 pb-2">Review Speed</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: "standard" as const, label: "Standard", price: VERIFICATION_FEE_STANDARD_USD, desc: "Reviewed within 24-48 hours" },
                        { id: "fast" as const, label: "Fast-Track", price: VERIFICATION_FEE_FAST_USD, desc: "Jumps the queue, reviewed within hours" },
                      ].map((t) => (
                        <button key={t.id} type="button" onClick={() => setTier(t.id)}
                          className={`text-left rounded-2xl border-2 p-4 transition-all ${tier === t.id ? "border-pink-500 bg-pink-50 shadow-md" : "border-border hover:border-pink-300/60"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm flex items-center gap-1">
                              {t.id === "fast" && <Zap className="w-3.5 h-3.5 text-amber-500" />}{t.label}
                            </span>
                            <span className="font-extrabold text-lg text-pink-600">${t.price}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chain select */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-border/50 pb-2">Pay Fee On</h3>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">EVM Chains</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {SUPPORTED_CHAINS.map((c) => (
                          <button key={c.id} type="button" onClick={() => handleEvmChainSelect(c.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                              selectedEvmId === c.id ? "border-pink-500 bg-pink-50 shadow-md" : "border-border hover:border-pink-300/60"
                            }`}>
                            <ChainIcon chain={c.icon} size={24} />
                            <span className="text-xs font-bold text-pink-800 text-center leading-tight">{c.name}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mt-3">SVM Chains</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {SVM_CHAINS.map((sc) => (
                          <button key={sc.key} type="button" onClick={() => handleSvmSelect(sc.key)}
                            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-purple-200 hover:border-purple-400 bg-purple-50/50 p-3 transition-all">
                            <ChainIcon chain={sc.icon} size={24} />
                            <span className="text-xs font-bold text-purple-700 text-center leading-tight">{sc.name}</span>
                            <span className="text-[9px] bg-purple-100 text-purple-600 rounded px-1 font-bold">SVM</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedEvmChain && chain && chain.id !== selectedEvmChain.id && isConnected && (
                      <p className="text-xs font-semibold text-amber-600">
                        Your wallet is on a different network — you&apos;ll be prompted to switch to {selectedEvmChain.name}.
                      </p>
                    )}
                    {selectedEvmChain && (
                      <div className="bg-white border-2 border-pink-200/60 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center space-x-3">
                          <ChainIcon chain={selectedEvmChain.icon} size={28} />
                          <div>
                            <p className="text-xs uppercase tracking-wide font-bold text-pink-400">Verification Fee</p>
                            <p className="text-xl font-extrabold text-pink-900">
                              ${feeUsd.toFixed(2)}
                              <span className="text-sm font-semibold text-pink-500 ml-2">
                                ≈ {evmFee.loading ? "…" : `${formatNativeAmount(evmFee.native)} ${selectedEvmChain.symbol}`}
                              </span>
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${evmFee.isLive ? "bg-emerald-50 text-emerald-500 border border-emerald-200" : "bg-pink-50/50 text-pink-600/80 border border-pink-200/60"}`}>
                          {evmFee.isLive ? "● Live price" : "Est. price"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project basics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-border/50 pb-2">Project Basics</h3>
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        Contract Address *
                        {selectedEvmChain && (
                          <span className="text-xs text-pink-400 ml-2">EVM 0x format</span>
                        )}
                      </Label>
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
                        <Input id="twitter" type="url" placeholder="https://x.com/yourproject" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegram">Telegram Group</Label>
                        <Input id="telegram" type="url" placeholder="https://t.me/yourproject" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-border/50 pb-2">Trust &amp; Security</h3>
                    <div className="space-y-2">
                      <Label htmlFor="audit">Audit Link (Optional)</Label>
                      <Input id="audit" type="url" placeholder="Link to Certik, Hacken, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="details">Why should we verify you? *</Label>
                      <Textarea id="details" placeholder="Tell us about the team, locked liquidity, utility, etc." required className="min-h-[120px]" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border mt-6 pt-6">
                  <Button type="submit" size="lg"
                    disabled={isSending || !selectedEvmChain || !treasuryConfigured}
                    className="w-full bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:from-pink-500 hover:via-pink-600 hover:to-pink-700 text-white font-extrabold text-base h-12 rounded-full shadow-md disabled:opacity-50">
                    {isSending ? (
                      <span className="flex items-center justify-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Confirming in wallet…</span>
                      </span>
                    ) : !selectedEvmChain ? (
                      <span>Select a chain to pay the fee</span>
                    ) : isConnected ? (
                      <span className="flex items-center justify-center space-x-2">
                        <BadgeCheck className="w-4 h-4" />
                        <span>Pay ${feeUsd} &amp; Submit Application</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Wallet className="w-4 h-4" /><span>Connect Wallet to Continue</span>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* ── SVM form ── */}
          {isSvmSelected && selectedSvmMeta && (
            <Card className="border-purple-200 rounded-3xl shadow-sm">
              <form onSubmit={handleSvmSubmit}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <ChainIcon chain={selectedSvmMeta.icon} size={32} />
                    <div>
                      <CardTitle className="text-purple-800">{selectedSvmMeta.name} Verification</CardTitle>
                      <CardDescription>SVM chain — use Phantom or Backpack</CardDescription>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedSvm(null)}
                    className="text-xs text-purple-400 hover:text-purple-600 font-semibold text-left">
                    ← Switch to EVM chain
                  </button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tier */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-purple-100 pb-2">Review Speed</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: "standard" as const, label: "Standard", price: VERIFICATION_FEE_STANDARD_USD, desc: "24-48 hours" },
                        { id: "fast" as const, label: "Fast-Track", price: VERIFICATION_FEE_FAST_USD, desc: "Within hours" },
                      ].map((t) => (
                        <button key={t.id} type="button" onClick={() => setTier(t.id)}
                          className={`text-left rounded-2xl border-2 p-4 transition-all ${tier === t.id ? "border-purple-500 bg-purple-50 shadow-md" : "border-purple-200 hover:border-purple-400"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm flex items-center gap-1">
                              {t.id === "fast" && <Zap className="w-3.5 h-3.5 text-amber-500" />}{t.label}
                            </span>
                            <span className="font-extrabold text-lg text-purple-600">${t.price}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVM wallet status */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold border-b border-purple-100 pb-2">SVM Wallet</h3>
                    {anySvmConnected ? (
                      <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-purple-700">
                            {solana.walletId === "phantom" ? "Phantom" : "Backpack"} connected
                          </p>
                          <p className="text-xs font-mono text-purple-400">
                            {solana.publicKey?.slice(0, 8)}…{solana.publicKey?.slice(-6)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setWalletOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
                        <Wallet className="w-4 h-4" />
                        Connect Phantom / Backpack
                      </button>
                    )}
                  </div>

                  {/* Fee payment instructions */}
                  {anySvmConnected && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b border-purple-100 pb-2">Pay Verification Fee</h3>
                      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm font-bold text-purple-700">Amount to send</p>
                          <div className="text-right">
                            <p className="text-lg font-extrabold text-purple-800">
                              ${feeUsd} USD
                              {selectedSvm === "solana" && solFee.native !== null && (
                                <span className="text-sm font-semibold text-purple-500 ml-2">
                                  ≈ {formatNativeAmount(solFee.native)} SOL
                                </span>
                              )}
                            </p>
                            {selectedSvm === "solana" && (
                              <p className={`text-[10px] font-semibold ${solFee.isLive ? "text-emerald-500" : "text-purple-400"}`}>
                                {solFee.isLive ? "● Live SOL price" : "Est. price"}
                              </p>
                            )}
                          </div>
                        </div>
                        {SOL_TREASURY ? (
                          <div>
                            <p className="text-xs text-purple-500 font-semibold mb-1">Treasury address ({selectedSvmMeta.symbol})</p>
                            <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2">
                              <span className="font-mono text-xs text-purple-800 truncate flex-1">{SOL_TREASURY}</span>
                              <button type="button" onClick={() => { navigator.clipboard.writeText(SOL_TREASURY!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                className="shrink-0 text-purple-400 hover:text-purple-600">
                                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-xs text-purple-400 mt-1">
                              Send from your {solana.walletId === "phantom" ? "Phantom" : "Backpack"} wallet to this address.
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                              Set <code className="bg-amber-100 px-1 rounded">VITE_SOLANA_TREASURY_ADDRESS</code> to show the {selectedSvmMeta.symbol} treasury address.
              Until then, contact us at barbiefunlaunchpad@gmail.com to arrange payment.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="svm-tx-sig" className="font-bold text-purple-700">
                          Transaction Signature *
                        </Label>
                        <Input
                          id="svm-tx-sig"
                          placeholder="Paste your tx signature after sending the fee…"
                          value={svmTxSig}
                          onChange={(e) => { setSvmTxSig(e.target.value); setSvmVerifyError(null); }}
                          className="font-mono border-purple-200 focus:border-purple-400"
                          required
                        />
                        {svmTxSig && !isValidSvmSig(svmTxSig) && (
                          <p className="text-xs text-rose-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Invalid signature format — paste the full base58 transaction signature.
                          </p>
                        )}
                        {svmTxSig && isValidSvmSig(svmTxSig) && (
                          <div className="flex items-center gap-1.5">
                            <a href={`${selectedSvmMeta.explorer}${svmTxSig}`} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 font-semibold">
                              Verify on {selectedSvmMeta.name === "Solana" ? "Solscan" : "X1 Explorer"}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {svmVerifyError && (
                          <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mt-1">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-rose-700 font-medium">{svmVerifyError}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Project basics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-purple-100 pb-2">Project Basics</h3>
                    <div className="space-y-2">
                      <Label htmlFor="svm-address">
                        Contract Address *
                        <span className="text-xs text-purple-400 ml-2">
                          {selectedSvmMeta.key === "solana" ? "Solana SPL mint address (base58)" : "X1 address (base58)"}
                        </span>
                      </Label>
                      <Input id="svm-address"
                        placeholder={selectedSvmMeta.key === "solana" ? "E.g. 4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" : "X1 token address"}
                        required className="font-mono" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Project Name *</Label>
                        <Input required />
                      </div>
                      <div className="space-y-2">
                        <Label>Website *</Label>
                        <Input type="url" placeholder="https://" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Twitter / X URL</Label>
                        <Input type="url" placeholder="https://x.com/yourproject" />
                      </div>
                      <div className="space-y-2">
                        <Label>Telegram</Label>
                        <Input type="url" placeholder="https://t.me/yourproject" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Why should we verify you? *</Label>
                      <Textarea placeholder="Tell us about the team, locked liquidity, utility, etc." required className="min-h-[100px]" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-purple-50/50 border-t border-purple-100 mt-6 pt-6">
                  <Button type="submit" size="lg"
                    disabled={svmSubmitting || !anySvmConnected || !isValidSvmSig(svmTxSig)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-extrabold text-base h-12 rounded-full shadow-md disabled:opacity-50">
                    {svmSubmitting ? (
                      <span className="flex items-center justify-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Submitting…</span>
                      </span>
                    ) : !anySvmConnected ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Wallet className="w-4 h-4" /><span>Connect SVM Wallet</span>
                      </span>
                    ) : !isValidSvmSig(svmTxSig) ? (
                      <span>Paste tx signature to continue</span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <BadgeCheck className="w-4 h-4" />
                        <span>Submit {selectedSvmMeta.name} Verification</span>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>

        {/* Sidebar */}
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
                {[
                  "Liquidity must be locked or burned",
                  "Contract source code verified on explorer",
                  "Active social media presence",
                  "No malicious functions (honeypot, tax > 10%)",
                ].map((c) => (
                  <li key={c} className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Chain explorers quick-link */}
          <Card className="border-border/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-pink-700">Chain Explorers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "BscScan", url: "https://bscscan.com", icon: "bnb" },
                { name: "BaseScan", url: "https://basescan.org", icon: "base" },
                { name: "Solscan", url: "https://solscan.io", icon: "solana" },
                { name: "X1 Explorer", url: "https://explorer.x1.xyz", icon: "x1" },
                { name: "OKX Explorer", url: "https://www.okx.com/explorer/xlayer", icon: "xlayer" },
              ].map((ex) => (
                <a key={ex.name} href={ex.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-pink-600/80 hover:text-pink-500 font-medium transition-colors">
                  <ChainIcon chain={ex.icon} size={14} />
                  {ex.name}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
