/**
 * Launch Wizard — supports EVM chains (via wagmi) and SVM chains (X1, Solana)
 * via a manual fee-payment flow identical in UX to the EVM flow.
 *
 * EVM chains: sendTransactionAsync → on-chain fee → auto-confirm
 * SVM chains: show treasury address → user sends from Phantom/Backpack → paste tx signature
 *
 * Both paths store the launch record in localStorage so it appears in the feed.
 */
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Rocket, CheckCircle2, Upload, AlertCircle, Wallet,
  ExternalLink, Info, Copy, ImageIcon,
} from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { motion } from "framer-motion";
import { useAccount, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther, parseUnits, isAddress } from "viem";
import WalletModal from "@/components/WalletModal";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import { useLaunchFeeNative, formatNativeAmount, LAUNCH_FEE_USD, useNativeTokenPriceUsd } from "@/lib/pricing";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { verifySvmPayment } from "@/lib/svmVerify";
import { useAddLaunch } from "@/hooks/useLaunches";
import { getReferral } from "@/hooks/useReferral";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EVM_EXPLORERS: Record<number, string> = {
  56:      "https://bscscan.com/tx/",
  8453:    "https://basescan.org/tx/",
  196:     "https://www.okx.com/explorer/xlayer/tx/",
  369:     "https://scan.pulsechain.com/tx/",
  4663:    "https://robinhoodchain.blockscout.com/tx/",
};

const EVM_TREASURY = import.meta.env.VITE_LAUNCH_FEE_TREASURY_ADDRESS as string | undefined;
const SOL_TREASURY = import.meta.env.VITE_SOLANA_TREASURY_ADDRESS as string | undefined;

const SVM_DISPLAY_CHAINS = DISPLAY_CHAINS.filter((c) => c.isSvm);

/**
 * Validate a base58-encoded SVM transaction signature.
 * Solana/X1 tx signatures are 64-byte Ed25519 values — base58 of 64 bytes
 * produces exactly 87 or 88 characters in the standard base58 alphabet.
 */
function isValidSvmSig(sig: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(sig.trim());
}

// ---------------------------------------------------------------------------
// Launch page
// ---------------------------------------------------------------------------
export default function Launch() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const solana = useSolanaWallet();

  const [walletOpen,     setWalletOpen]     = useState(false);
  const [selectedEvmId,  setSelectedEvmId]  = useState<number | null>(null);
  const [selectedSvmId,  setSelectedSvmId]  = useState<number | null>(-1); // -1 = X1 (primary), -2 = Solana
  const [svmTxSig,       setSvmTxSig]       = useState("");
  const [svmSubmitting,  setSvmSubmitting]  = useState(false);
  const [svmVerifyError, setSvmVerifyError] = useState<string | null>(null);
  const [successData,    setSuccessData]    = useState<{
    ticker: string; txHash: string; chainId: number; chainName: string; explorerBase: string;
  } | null>(null);
  const [copied,         setCopied]         = useState(false);
  const [formData,       setFormData]       = useState({
    name: "", ticker: "", supply: "1000000000", description: "",
    website: "", twitter: "", telegram: "",
    decimals: "9", mintAuthority: true, freezeAuthority: false,
  });
  const [logoObjectPath, setLogoObjectPath] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const { uploadFile, isUploading: isUploadingLogo } = useUpload({
    onSuccess: (res) => setLogoObjectPath(res.objectPath),
    onError: (err) => console.error("Logo upload failed", err),
  });

  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();

  // derived
  const selectedEvmChain = SUPPORTED_CHAINS.find((c) => c.id === selectedEvmId);
  const selectedSvmChain = SVM_DISPLAY_CHAINS.find((c) => c.id === selectedSvmId);
  const isSvmMode        = selectedSvmId !== null;
  const evmFee = useLaunchFeeNative(selectedEvmChain?.symbol ?? "", selectedEvmChain?.isStableGas);
  const treasuryEvm = !!EVM_TREASURY && isAddress(EVM_TREASURY);
  const solPriceUsd = useNativeTokenPriceUsd("SOL");
  const addLaunchMutation = useAddLaunch();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const selectEvmChain = (chainId: number) => {
    setSelectedEvmId(chainId);
    setSelectedSvmId(null);
    setSvmTxSig("");
    if (isConnected && chain?.id !== chainId) switchChain({ chainId });
  };

  const selectSvmChain = (id: number) => {
    setSelectedSvmId(id);
    setSelectedEvmId(null);
    setSvmTxSig("");
  };

  const fd = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    setLogoPreviewUrl(URL.createObjectURL(file));
    await uploadFile(file);
  };

  // EVM submit
  const handleEvmSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) { setWalletOpen(true); return; }
    if (!selectedEvmChain) return;
    if (chain?.id !== selectedEvmChain.id) { switchChain({ chainId: selectedEvmChain.id }); return; }
    if (!treasuryEvm || evmFee.native === null) return;

    try {
      const decimals = selectedEvmChain.symbol === "USDC" ? 6 : 18;
      const value = selectedEvmChain.isStableGas
        ? parseUnits(evmFee.native.toFixed(decimals), decimals)
        : parseEther(evmFee.native.toFixed(18));

      const txHash = await sendTransactionAsync({ to: EVM_TREASURY as `0x${string}`, value });

      await addLaunchMutation.mutateAsync({
        id: `${selectedEvmChain.id}-${txHash}`,
        name: formData.name,
        ticker: formData.ticker || "TOKEN",
        description: formData.description,
        website: formData.website || null,
        twitter: formData.twitter || null,
        telegram: formData.telegram || null,
        totalSupply: formData.supply,
        chainId: selectedEvmChain.id,
        chainName: selectedEvmChain.name,
        deployer: address!,
        feeTxHash: txHash,
        mintAuthority: formData.mintAuthority,
        freezeAuthority: formData.freezeAuthority,
        referredBy: getReferral(),
        logoUrl: logoObjectPath ?? null,
      });

      setSuccessData({
        ticker: formData.ticker || "TOKEN",
        txHash,
        chainId: selectedEvmChain.id,
        chainName: selectedEvmChain.name,
        explorerBase: EVM_EXPLORERS[selectedEvmChain.id] ?? "",
      });
    } catch (err) {
      console.error("Launch fee payment failed", err);
    }
  };

  // SVM submit
  const handleSvmSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSvmChain || !isValidSvmSig(svmTxSig)) return;
    setSvmSubmitting(true);
    setSvmVerifyError(null);
    try {
      // Compute minimum lamports for Solana (skip for X1 — no reliable price feed)
      let minLamports = 0;
      if (selectedSvmChain.id === -2 && typeof solPriceUsd === "number" && solPriceUsd > 0) {
        minLamports = Math.floor((LAUNCH_FEE_USD / solPriceUsd) * 1e9 * 0.95);
      }

      const result = await verifySvmPayment(
        svmTxSig.trim(),
        (selectedSvmChain as any).rpc,
        SOL_TREASURY ?? "",
        minLamports,
      );

      if (!result.ok) {
        setSvmVerifyError(result.message);
        setSvmSubmitting(false);
        return;
      }
      const deployer = solana.publicKey ?? "unknown";
      await addLaunchMutation.mutateAsync({
        id: `${selectedSvmChain.id}-${svmTxSig.slice(0, 20)}`,
        name: formData.name,
        ticker: formData.ticker || "TOKEN",
        description: formData.description,
        website: formData.website || null,
        twitter: formData.twitter || null,
        telegram: formData.telegram || null,
        totalSupply: formData.supply,
        chainId: selectedSvmChain.id,
        chainName: selectedSvmChain.name,
        deployer,
        feeTxHash: svmTxSig.trim(),
        mintAuthority: formData.mintAuthority,
        freezeAuthority: formData.freezeAuthority,
        referredBy: getReferral(),
        logoUrl: logoObjectPath ?? null,
      });
      const explorer = selectedSvmChain.id === -2 ? "https://solscan.io/tx/" : "https://explorer.x1.xyz/tx/";
      setSuccessData({
        ticker: formData.ticker || "TOKEN",
        txHash: svmTxSig.trim(),
        chainId: selectedSvmChain.id,
        chainName: selectedSvmChain.name,
        explorerBase: explorer,
      });
    } finally {
      setSvmSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-500">
        <Card className="border-pink-200/60 shadow-xl text-center py-12">
          <CardContent className="space-y-6 flex flex-col items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Launch Fee Paid!</h2>
              <p className="text-pink-600 text-lg font-semibold">
                ${successData.ticker} launch request recorded on {successData.chainName}
              </p>
            </div>
            <div className="w-full max-w-md space-y-4">
              <div className="bg-pink-50 border border-pink-200/60 p-4 rounded-2xl text-left">
                <Label className="text-pink-500 text-xs font-bold uppercase tracking-wide mb-2 block">Fee Transaction</Label>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-pink-100">
                  <span className="font-mono text-xs text-pink-700 truncate">{successData.txHash}</span>
                  {successData.explorerBase && (
                    <a href={`${successData.explorerBase}${successData.txHash}`} target="_blank" rel="noopener noreferrer"
                      className="ml-2 shrink-0 text-pink-500 hover:text-pink-700">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-start space-x-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Your ${LAUNCH_FEE_USD} launch fee has been paid. Token contract deployment is the next production step — all launches on Barbie Fun are fair with 100% of supply minted to your wallet.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link href="/" className="flex-1 min-w-[140px]">
                <Button className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-bold rounded-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto py-8 pb-20 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 bg-clip-text text-transparent">Launch Your Token</span>
        </h1>
        <p className="text-pink-600 font-medium">Fair launch, locked liquidity, zero team tokens.</p>
      </div>

      {!treasuryEvm && !isSvmMode && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-amber-700">
            EVM treasury not configured. Set <code className="bg-amber-100 px-1 rounded">VITE_LAUNCH_FEE_TREASURY_ADDRESS</code>.
          </p>
        </div>
      )}

      {/* ── EVM wallet banner ── */}
      {!isSvmMode && !isConnected && (
        <div className="mb-6 bg-pink-50 border border-pink-200/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-pink-500 shrink-0" />
            <p className="text-sm font-semibold text-pink-700">Connect your EVM wallet to pay the launch fee on-chain</p>
          </div>
          <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-bold rounded-full shrink-0">
            Connect
          </Button>
        </div>
      )}
      {!isSvmMode && isConnected && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-600">EVM wallet connected</p>
              <p className="text-xs text-emerald-400 font-mono">{address?.slice(0, 12)}…{address?.slice(-6)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SVM wallet banner ── */}
      {isSvmMode && !solana.connected && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-purple-500 shrink-0" />
            <p className="text-sm font-semibold text-purple-700">Connect Phantom or Backpack to launch on {selectedSvmChain?.name}</p>
          </div>
          <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shrink-0">
            Connect SVM
          </Button>
        </div>
      )}
      {isSvmMode && solana.connected && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-purple-700">
              {solana.walletId === "phantom" ? "Phantom" : "Backpack"} connected
            </p>
            <p className="text-xs text-purple-400 font-mono">{solana.publicKey?.slice(0, 10)}…{solana.publicKey?.slice(-6)}</p>
          </div>
        </div>
      )}

      {/* ── Chain selector ── */}
      <Card className="border-pink-100 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold text-pink-600">1. Choose a Chain *</CardTitle>
          <CardDescription>Select which network to launch your token on</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* EVM chains */}
          <div>
            <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2">EVM Chains</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPORTED_CHAINS.map((c) => (
                <button key={c.id} type="button" onClick={() => selectEvmChain(c.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                    selectedEvmId === c.id ? "border-pink-500 bg-pink-50 shadow-md" : "border-pink-100 hover:border-pink-300/60"
                  }`}>
                  <ChainIcon chain={c.icon} size={28} />
                  <span className="text-xs font-bold text-pink-800 text-center leading-tight">{c.name}</span>
                  <span className="text-[9px] text-pink-400 font-semibold">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SVM chains */}
          <div>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">SVM Chains</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SVM_DISPLAY_CHAINS.map((c) => (
                <button key={c.id} type="button" onClick={() => selectSvmChain(c.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                    selectedSvmId === c.id ? "border-purple-500 bg-purple-50 shadow-md" : "border-purple-200 hover:border-purple-400"
                  }`}>
                  <ChainIcon chain={c.icon} size={28} />
                  <span className="text-xs font-bold text-purple-700 text-center leading-tight">{c.name}</span>
                  <span className="text-[9px] bg-purple-100 text-purple-600 rounded px-1 font-bold">SVM · {c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network switch warning */}
          {selectedEvmChain && chain && chain.id !== selectedEvmChain.id && isConnected && (
            <p className="text-xs font-semibold text-amber-600">
              Your wallet is on a different network — you&apos;ll be prompted to switch to {selectedEvmChain.name}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Token details form ── */}
      {(selectedEvmChain || selectedSvmChain) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left — Token basics */}
            <Card className="border-pink-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-pink-600">2. Token Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-semibold text-pink-800 mb-1.5 block">Token Name *</Label>
                  <Input placeholder="e.g. Barbie Coin" required value={formData.name} onChange={fd("name")} className="border-pink-200/60 focus:border-pink-400" />
                </div>
                <div>
                  <Label className="font-semibold text-pink-800 mb-1.5 block">Ticker Symbol *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 font-bold">$</span>
                    <Input placeholder="BARBIE" required maxLength={10}
                      value={formData.ticker} onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                      className="pl-7 border-pink-200/60 focus:border-pink-400 uppercase" />
                  </div>
                </div>
                <div>
                  <Label className="font-semibold text-pink-800 mb-1.5 block">Total Supply</Label>
                  <Input type="number" value={formData.supply} onChange={fd("supply")} className="border-pink-200/60 focus:border-pink-400" />
                  <p className="text-xs text-pink-400 mt-1">All supply minted to your wallet on deploy</p>
                </div>
                {/* SVM-specific fields */}
                {isSvmMode && (
                  <>
                    <div>
                      <Label className="font-semibold text-pink-800 mb-1.5 block">Decimals</Label>
                      <Input type="number" min="0" max="9" value={formData.decimals} onChange={fd("decimals")} className="border-pink-200/60 focus:border-pink-400" />
                      <p className="text-xs text-pink-400 mt-1">Standard SPL token uses 9 decimals</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-pink-800 block">Authority Settings</Label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formData.mintAuthority}
                            onChange={(e) => setFormData({ ...formData, mintAuthority: e.target.checked })}
                            className="rounded border-pink-300/60 text-pink-500" />
                          <span className="text-sm font-medium text-pink-800">Mint authority</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formData.freezeAuthority}
                            onChange={(e) => setFormData({ ...formData, freezeAuthority: e.target.checked })}
                            className="rounded border-pink-300/60 text-pink-500" />
                          <span className="text-sm font-medium text-pink-800">Freeze authority</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <Label className="font-semibold text-pink-800 mb-1.5 block">Description</Label>
                  <Textarea placeholder="Tell the community about your token…" value={formData.description} onChange={fd("description")} className="border-pink-200/60 focus:border-pink-400 resize-none" rows={3} />
                </div>
              </CardContent>
            </Card>

            {/* Right — Logo + socials */}
            <div className="space-y-6">
              <Card className="border-pink-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-extrabold text-pink-600">Token Logo</CardTitle>
                  <CardDescription>Upload a square image (PNG/SVG, max 2MB)</CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-pink-300/60 rounded-2xl cursor-pointer hover:bg-pink-50 transition-colors relative overflow-hidden">
                    {logoPreviewUrl ? (
                      <img src={logoPreviewUrl} alt="Logo preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                    ) : isUploadingLogo ? (
                      <>
                        <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin mb-2" />
                        <span className="text-xs font-semibold text-pink-400">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-pink-400 mb-2" />
                        <span className="text-sm font-semibold text-pink-500">Click to upload</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                  {logoObjectPath && (
                    <p className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Logo uploaded
                    </p>
                  )}
                  {logoPreviewUrl && !logoObjectPath && !isUploadingLogo && (
                    <p className="mt-2 text-xs text-amber-500 font-semibold flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> Upload in progress…
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-extrabold text-pink-600">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-semibold text-pink-800 mb-1.5 block">Website</Label>
                    <Input placeholder="https://yourtoken.com" value={formData.website} onChange={fd("website")} className="border-pink-200/60 focus:border-pink-400" />
                  </div>
                  <div>
                    <Label className="font-semibold text-pink-800 mb-1.5 block">Twitter / X</Label>
                    <Input placeholder="https://x.com/yourtoken" value={formData.twitter} onChange={fd("twitter")} className="border-pink-200/60 focus:border-pink-400" />
                  </div>
                  <div>
                    <Label className="font-semibold text-pink-800 mb-1.5 block">Telegram</Label>
                    <Input placeholder="https://t.me/yourtoken" value={formData.telegram} onChange={fd("telegram")} className="border-pink-200/60 focus:border-pink-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── EVM fee + submit ── */}
          {selectedEvmChain && (
            <form onSubmit={handleEvmSubmit} className="space-y-6">
              <div className="bg-white border-2 border-pink-200/60 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <ChainIcon chain={selectedEvmChain.icon} size={32} />
                  <div>
                    <p className="text-xs uppercase tracking-wide font-bold text-pink-400">3. Launch Fee</p>
                    <p className="text-2xl font-extrabold text-pink-900">
                      ${LAUNCH_FEE_USD.toFixed(2)}
                      <span className="text-base font-semibold text-pink-500 ml-2">
                        ≈ {evmFee.loading ? "…" : `${formatNativeAmount(evmFee.native)} ${selectedEvmChain.symbol}`}
                      </span>
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${evmFee.isLive ? "bg-emerald-50 text-emerald-500 border border-emerald-200" : "bg-pink-50/50 text-pink-600/80 border border-pink-200/60"}`}>
                  {evmFee.isLive ? "● Live price" : "Est. price"}
                </span>
              </div>
              <div className="bg-pink-50 border border-pink-200/60 rounded-2xl p-5 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                <p className="text-sm text-pink-700">
                  <strong className="block mb-1">Fair Launch — All launches on Barbie Fun are fair.</strong>
                  100% of the initial supply mints to your wallet. This step records your request and charges the ${LAUNCH_FEE_USD} fee; contract deployment is the next step.
                </p>
              </div>
              <Button type="submit" size="lg" disabled={isSending || !treasuryEvm}
                className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 text-white font-extrabold text-lg h-14 rounded-full shadow-lg hover:shadow-pink-300/60 disabled:opacity-50">
                {isSending ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Confirming in wallet…</span>
                  </span>
                ) : isConnected ? (
                  <span className="flex items-center space-x-2">
                    <Rocket className="w-5 h-5" /><span>Pay Launch Fee on {selectedEvmChain.name}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5" /><span>Connect Wallet to Launch</span>
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* ── SVM fee + submit ── */}
          {selectedSvmChain && (
            <form onSubmit={handleSvmSubmit} className="space-y-6">
              {/* Fee instructions */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <ChainIcon chain={selectedSvmChain.icon} size={32} />
                  <div>
                    <p className="text-xs uppercase tracking-wide font-bold text-purple-400">3. Launch Fee</p>
                    <p className="text-2xl font-extrabold text-pink-900">
                      ${LAUNCH_FEE_USD.toFixed(2)} USD
                      <span className="text-sm font-semibold text-purple-500 ml-2">
                        in {selectedSvmChain.symbol}
                      </span>
                    </p>
                  </div>
                </div>
                {SOL_TREASURY ? (
                  <div>
                    <p className="text-xs text-purple-500 font-semibold mb-1.5">Send {selectedSvmChain.symbol} to this treasury address</p>
                    <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2">
                      <span className="font-mono text-xs text-purple-800 truncate flex-1">{SOL_TREASURY}</span>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(SOL_TREASURY!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="shrink-0 text-purple-400 hover:text-purple-600 transition-colors">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                      Open your {solana.walletId === "phantom" ? "Phantom" : "Backpack"} wallet, send ${LAUNCH_FEE_USD} USD worth of {selectedSvmChain.symbol} to the address above, then paste the transaction signature below.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Set <code className="bg-amber-100 px-1 rounded">VITE_SOLANA_TREASURY_ADDRESS</code> to display the {selectedSvmChain.symbol} treasury. Contact us at barbiefunlaunchpad@gmail.com to arrange {selectedSvmChain.name} payment.
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction signature */}
              <div className="space-y-2">
                <Label htmlFor="svm-sig" className="font-semibold text-pink-800">
                  Transaction Signature *
                </Label>
                <Input
                  id="svm-sig"
                  placeholder={`Paste your ${selectedSvmChain.name} tx signature after sending the fee…`}
                  value={svmTxSig}
                  onChange={(e) => { setSvmTxSig(e.target.value); setSvmVerifyError(null); }}
                  className="font-mono border-purple-200 focus:border-purple-400"
                />
                {svmTxSig && !isValidSvmSig(svmTxSig) && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Invalid signature — paste the full base58 transaction signature.
                  </p>
                )}
                {svmTxSig && isValidSvmSig(svmTxSig) && (
                  <a
                    href={`${selectedSvmChain.id === -2 ? "https://solscan.io/tx/" : "https://explorer.x1.xyz/tx/"}${svmTxSig}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 font-semibold">
                    Verify on {selectedSvmChain.name === "Solana" ? "Solscan" : "X1 Explorer"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex items-start space-x-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-600">
                  All {selectedSvmChain.name} launches on Barbie Fun are fair — 100% of the initial supply mints to your wallet. The fee records your launch request; SPL token contract deployment follows.
                </p>
              </div>

              {svmVerifyError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-medium">{svmVerifyError}</p>
                </div>
              )}

              <Button type="submit" size="lg"
                disabled={svmSubmitting || !solana.connected || !isValidSvmSig(svmTxSig)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-extrabold text-lg h-14 rounded-full shadow-lg disabled:opacity-50">
                {svmSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Recording launch…</span>
                  </span>
                ) : !solana.connected ? (
                  <span className="flex items-center space-x-2"><Wallet className="w-5 h-5" /><span>Connect SVM Wallet</span></span>
                ) : !isValidSvmSig(svmTxSig) ? (
                  <span>Paste tx signature to continue</span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Rocket className="w-5 h-5" />
                    <span>Record {selectedSvmChain.name} Launch</span>
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      )}

      {walletOpen && (
        <WalletModal
          initialSection={isSvmMode ? "x1" : "evm"}
          onClose={() => setWalletOpen(false)}
        />
      )}
    </div>
  );
}
