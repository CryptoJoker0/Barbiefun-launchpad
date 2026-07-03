import { useConnect, useDisconnect, useAccount, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, X, Copy, LogOut, CheckCircle2, ChevronRight, AlertCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { SUPPORTED_CHAINS, X1_CHAIN_INFO } from "@/lib/wagmi";
import ChainIcon from "@/components/ChainIcon";

const WALLET_META: Record<string, { name: string; icon: string }> = {
  metaMask: { name: "MetaMask", icon: "🦊" },
  injected: { name: "Browser Wallet", icon: "🌐" },
  coinbaseWallet: { name: "Coinbase Wallet", icon: "🔵" },
  walletConnect: { name: "WalletConnect", icon: "🔗" },
  safe: { name: "Safe", icon: "🛡️" },
};

interface WalletModalProps {
  onClose: () => void;
}

export default function WalletModal({ onClose }: WalletModalProps) {
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"wallet" | "chain">("wallet");

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-pink-200 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-400 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">
              {isConnected ? "My Wallet" : "Connect Wallet"}
            </span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConnected ? (
          /* Connected State */
          <div className="p-6 space-y-4">
            {/* Address display */}
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-red-400 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-pink-200">
                <span className="text-2xl">👛</span>
              </div>
              <p className="font-mono font-bold text-gray-800 text-sm mb-1">{shortAddress}</p>
              <p className="text-xs text-pink-500 font-semibold">
                {chain ? chain.name : "Unsupported network"}
              </p>
              <button
                onClick={copyAddress}
                className="mt-2 flex items-center space-x-1 mx-auto text-xs text-pink-500 hover:text-pink-600 font-semibold"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy address"}</span>
              </button>
            </div>

            {/* Tab: switch chain */}
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
              <div className="space-y-2">
                {SUPPORTED_CHAINS.map((c) => (
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
                      <span className="font-semibold text-sm">{c.name}</span>
                      {c.isTestnet && (
                        <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                          TESTNET
                        </span>
                      )}
                    </div>
                    {chain?.id === c.id && <CheckCircle2 className="w-4 h-4 text-pink-500" />}
                  </button>
                ))}

                {/* X1 — non-EVM, not connectable here */}
                <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 opacity-80">
                  <div className="flex items-center space-x-3">
                    <ChainIcon chain="x1" size={22} />
                    <div className="text-left">
                      <span className="font-semibold text-sm text-gray-600">X1 Blockchain</span>
                      <p className="text-[10px] text-gray-400">Needs a Solana wallet (SVM)</p>
                    </div>
                  </div>
                  <a href={X1_CHAIN_INFO.bridge} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
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
          </div>
        ) : (
          /* Not connected — show wallet options */
          <div className="p-6 space-y-3">
            <p className="text-sm text-gray-500 text-center mb-4">
              Choose your wallet to connect to Barbie Fun
            </p>

            {connectors.map((connector) => {
              const meta = WALLET_META[connector.id] || {
                name: connector.name,
                icon: "💼",
              };
              return (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-pink-50 border border-pink-100 hover:border-pink-300 rounded-2xl transition-all group disabled:opacity-60"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{meta.icon}</span>
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

            <div className="flex items-start space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                X1 Blockchain isn&apos;t shown here — it runs on the Solana Virtual Machine and needs a
                Solana wallet like Phantom, not MetaMask/WalletConnect.
              </span>
            </div>

            <p className="text-center text-xs text-pink-300 pt-2">
              By connecting you agree to our Terms of Service
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
