import { useConnect, useDisconnect, useAccount, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  Wallet, X, Copy, LogOut, CheckCircle2, ChevronRight,
  AlertCircle, ExternalLink, Globe, CircleDollarSign, Link2,
  ShieldCheck, Briefcase, Zap,
} from "lucide-react";
import { useState } from "react";
import { SUPPORTED_CHAINS, X1_CHAIN_INFO } from "@/lib/wagmi";
import ChainIcon from "@/components/ChainIcon";
import { useSolanaWallet, isPhantomAvailable, isBackpackAvailable } from "@/hooks/useSolanaWallet";

const WALLET_META: Record<string, { name: string; icon: LucideIcon }> = {
  metaMask: { name: "MetaMask", icon: Wallet },
  injected: { name: "Browser Wallet", icon: Globe },
  coinbaseWallet: { name: "Coinbase Wallet", icon: CircleDollarSign },
  walletConnect: { name: "WalletConnect", icon: Link2 },
  safe: { name: "Safe", icon: ShieldCheck },
};

interface WalletModalProps {
  onClose: () => void;
}

/** Shorten a Solana public key for display */
function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

export default function WalletModal({ onClose }: WalletModalProps) {
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"wallet" | "chain">("wallet");
  const [section, setSection] = useState<"evm" | "x1">("evm");

  const solana = useSolanaWallet();
  const phantomAvailable = isPhantomAvailable();
  const backpackAvailable = isBackpackAvailable();

  const copyAddress = () => {
    const addr = address ?? solana.publicKey ?? "";
    if (addr) {
      navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const anyConnected = isConnected || solana.connected;

  // ---------- Connected view ----------
  if (anyConnected) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl border border-pink-200 w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-400 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">My Wallet</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Address display */}
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-red-400 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-pink-200">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <p className="font-mono font-bold text-gray-800 text-sm mb-1">
                {isConnected ? shortAddress : solana.publicKey ? shortPk(solana.publicKey) : ""}
              </p>
              <p className="text-xs text-pink-500 font-semibold">
                {isConnected
                  ? (chain ? chain.name : "Unsupported network")
                  : `X1 Blockchain · ${solana.walletId === "phantom" ? "Phantom" : "Backpack"}`}
              </p>
              <button
                onClick={copyAddress}
                className="mt-2 flex items-center space-x-1 mx-auto text-xs text-pink-500 hover:text-pink-600 font-semibold"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy address"}</span>
              </button>
            </div>

            {isConnected && (
              <>
                <div className="flex space-x-2 bg-pink-50 rounded-xl p-1">
                  <button
                    onClick={() => setTab("wallet")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === "wallet" ? "bg-white text-pink-600 shadow-sm" : "text-pink-400"}`}
                  >
                    Wallet
                  </button>
                  <button
                    onClick={() => setTab("chain")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === "chain" ? "bg-white text-pink-600 shadow-sm" : "text-pink-400"}`}
                  >
                    Switch Chain
                  </button>
                </div>

                {tab === "chain" ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {SUPPORTED_CHAINS.filter((c) => !c.isSvm).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => switchChain({ chainId: c.id })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                          chain?.id === c.id
                            ? "border-pink-400 bg-pink-50 text-pink-700 font-bold"
                            : "border-pink-100 bg-white hover:border-pink-200 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <ChainIcon chain={c.icon} size={22} />
                          <div className="text-left">
                            <span className="font-semibold text-sm">{c.name}</span>
                            <p className="text-[10px] text-gray-400">{c.symbol} · native token</p>
                          </div>
                        </div>
                        {chain?.id === c.id && <CheckCircle2 className="w-4 h-4 text-pink-500" />}
                      </button>
                    ))}

                    {/* X1 — SVM, not EVM switchable */}
                    <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-purple-200 bg-purple-50/50">
                      <div className="flex items-center space-x-3">
                        <ChainIcon chain="x1" size={22} />
                        <div className="text-left">
                          <span className="font-semibold text-sm text-purple-700">X1 Blockchain</span>
                          <p className="text-[10px] text-purple-400">SVM · Use Phantom / Backpack</p>
                        </div>
                      </div>
                      <a href={X1_CHAIN_INFO.webWallet} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-600">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { disconnect(); onClose(); }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-3 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                )}
              </>
            )}

            {solana.connected && (
              <button
                onClick={() => { solana.disconnect(); onClose(); }}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-3 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect X1 Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Not connected view ----------
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-pink-200 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-400 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">Connect Wallet</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network selector tabs */}
        <div className="flex border-b border-pink-100">
          <button
            onClick={() => setSection("evm")}
            className={`flex-1 py-3 text-sm font-bold transition-all ${section === "evm" ? "text-pink-600 border-b-2 border-pink-500" : "text-gray-400 hover:text-pink-400"}`}
          >
            EVM Chains
          </button>
          <button
            onClick={() => setSection("x1")}
            className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${section === "x1" ? "text-purple-600 border-b-2 border-purple-500" : "text-gray-400 hover:text-purple-400"}`}
          >
            <Zap className="w-3.5 h-3.5" />
            X1 Blockchain
          </button>
        </div>

        <div className="p-6 space-y-3">
          {section === "evm" ? (
            <>
              <p className="text-sm text-gray-500 text-center mb-4">
                Choose your wallet to connect to Barbie Fun
              </p>

              {connectors.map((connector) => {
                const meta = WALLET_META[connector.id] || {
                  name: connector.name,
                  icon: Briefcase,
                };
                return (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-pink-50 border border-pink-100 hover:border-pink-300 rounded-2xl transition-all group disabled:opacity-60"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                        <meta.icon className="w-4.5 h-4.5 text-pink-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-800 text-sm">{meta.name}</p>
                        <p className="text-xs text-gray-400">
                          {connector.id === "injected" ? "Browser extension" :
                           connector.id === "walletConnect" ? "QR code / deep link" :
                           "Connect securely"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-pink-400 group-hover:text-pink-600 transition-colors" />
                  </button>
                );
              })}

              {error && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error.message.slice(0, 80)}</span>
                </div>
              )}

              <p className="text-center text-xs text-pink-300 pt-2">
                By connecting you agree to our Terms of Service
              </p>
            </>
          ) : (
            /* X1 Blockchain — Solana wallet section */
            <>
              <div className="flex items-center space-x-3 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 mb-2">
                <ChainIcon chain="x1" size={32} />
                <div>
                  <p className="font-bold text-purple-800 text-sm">X1 Blockchain</p>
                  <p className="text-xs text-purple-500">Solana VM · Native token: XN</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mb-1">
                X1 uses the Solana Virtual Machine. Connect with a Solana-compatible wallet below.
              </p>

              {/* Phantom */}
              <button
                onClick={() => solana.connect("phantom")}
                disabled={solana.isPending}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-2xl transition-all group disabled:opacity-60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0">
                    {/* Phantom ghost icon */}
                    <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
                      <path d="M64 8C33.1 8 8 33.1 8 64s25.1 56 56 56 56-25.1 56-56S94.9 8 64 8z" fill="url(#phantomGrad)"/>
                      <defs>
                        <linearGradient id="phantomGrad" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#534BB1"/>
                          <stop offset="1" stopColor="#551BF9"/>
                        </linearGradient>
                      </defs>
                      <path d="M105 55.5c0-1.5-.1-3-.3-4.4C102 36.5 90.8 26 77.1 26c-8.5 0-16 3.9-20.8 10-.8 1-1.4 1-2.2 0C49.3 29.9 41.8 26 33.3 26 19.6 26 8.4 36.5 6 51.1c-.2 1.4-.3 2.9-.3 4.4 0 26.9 29.8 55 58.3 55S105 82.4 105 55.5z" fill="white"/>
                      <ellipse cx="48" cy="55" rx="7" ry="9" fill="#534BB1"/>
                      <ellipse cx="80" cy="55" rx="7" ry="9" fill="#534BB1"/>
                      <ellipse cx="45.5" cy="53" rx="3" ry="4" fill="white"/>
                      <ellipse cx="77.5" cy="53" rx="3" ry="4" fill="white"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800 text-sm">Phantom</p>
                    <p className="text-xs text-gray-400">
                      {phantomAvailable ? "Detected — ready to connect" : "Click to install"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
              </button>

              {/* Backpack */}
              <button
                onClick={() => solana.connect("backpack")}
                disabled={solana.isPending}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-2xl transition-all group disabled:opacity-60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0">
                    {/* Backpack icon */}
                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                      <rect x="8" y="13" width="16" height="13" rx="3" fill="white"/>
                      <path d="M12 13v-2a4 4 0 0 1 8 0v2" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      <rect x="13" y="17" width="6" height="3" rx="1" fill="#1a1a2e"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800 text-sm">Backpack</p>
                    <p className="text-xs text-gray-400">
                      {backpackAvailable ? "Detected — ready to connect" : "Click to install"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
              </button>

              {/* X1 Web Wallet */}
              <a
                href={X1_CHAIN_INFO.webWallet}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-2xl transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <ChainIcon chain="x1" size={36} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800 text-sm">X1 Web Wallet</p>
                    <p className="text-xs text-gray-400">Opens wallet.x1.xyz in new tab</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
              </a>

              {solana.error && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{solana.error.slice(0, 100)}</span>
                </div>
              )}

              <div className="flex items-start space-x-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5 text-xs text-purple-500">
                <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-400" />
                <span>
                  X1 runs on the Solana Virtual Machine. EVM wallets (MetaMask, WalletConnect) cannot connect — use the Solana wallets above.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
