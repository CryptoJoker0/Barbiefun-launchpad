import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, Wallet, ChevronDown, Menu, X, CheckCircle2 } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import WalletModal from "@/components/WalletModal";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

export default function Navbar() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [chainOpen, setChainOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chain?.id);

  return (
    <>
      <nav className="border-b border-pink-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Brand */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 shrink-0">
                <img
                  src="/logo.png"
                  alt="Barbie Fun logo"
                  className="w-10 h-10 rounded-full object-cover border-2 border-pink-400 shadow-md"
                />
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-pink-500 via-red-400 to-pink-600 bg-clip-text text-transparent">
                  Barbie Fun
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex space-x-1">
                <Link href="/">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Terminal</Button>
                </Link>
                <Link href="/launch">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Launch</Button>
                </Link>
                <Link href="/verify">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Verify</Button>
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Social Icons */}
              <a href="https://t.me" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors" title="Telegram">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors" title="X (Twitter)">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-foreground"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>

              {/* Chain indicator (when connected) */}
              {isConnected && currentChain && (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 text-sm font-semibold text-pink-700">
                  <span>{currentChain.emoji}</span>
                  <span className="hidden lg:inline">{currentChain.name}</span>
                </div>
              )}

              {/* Chain selector (when not connected) */}
              {!isConnected && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setChainOpen(!chainOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 text-sm font-semibold text-pink-700 transition-colors"
                  >
                    <span>🟡</span>
                    <span className="hidden lg:inline">BNB</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {chainOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-pink-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {[
                        { emoji: "🟡", name: "BNB Chain", symbol: "BNB" },
                        { emoji: "🔷", name: "Ethereum", symbol: "ETH" },
                        { emoji: "🟠", name: "X Layer", symbol: "OKB" },
                        { emoji: "🟣", name: "Tempo", symbol: "TEMPO" },
                        { emoji: "🟢", name: "Arc Mainnet", symbol: "ARC" },
                        { emoji: "🟩", name: "Robinhood", symbol: "RHN" },
                      ].map((chain) => (
                        <button key={chain.symbol} onClick={() => setChainOpen(false)}
                          className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-pink-50 transition-colors text-left text-gray-700">
                          <span>{chain.emoji}</span><span>{chain.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Launch Token */}
              <Link href="/launch" className="hidden sm:block">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-4">
                  <Rocket className="w-4 h-4 mr-1.5" />
                  <span className="hidden lg:inline">Launch Token</span>
                  <span className="lg:hidden">Launch</span>
                </Button>
              </Link>

              {/* Wallet Button */}
              {isConnected ? (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="wallet-btn px-4 py-2 rounded-full text-sm font-bold border-2 border-pink-300 shadow-md hover:shadow-pink-300/50 transition-all"
                >
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-pink-700" />
                    <span className="hidden sm:inline font-mono">{shortAddress}</span>
                    <span className="sm:hidden">Connected</span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="wallet-btn px-4 py-2 rounded-full text-sm font-bold border-2 border-pink-300 shadow-md hover:shadow-pink-300/50 transition-all"
                >
                  <span className="flex items-center space-x-1.5">
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">Connect</span>
                  </span>
                </button>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-pink-50 text-pink-600">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-pink-100 py-3 space-y-1">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Terminal</div>
              </Link>
              <Link href="/launch" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Launch Token</div>
              </Link>
              <Link href="/verify" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Verify</div>
              </Link>
              <div className="px-4 py-2 flex items-center space-x-4">
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 text-sm text-pink-600 font-semibold">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 text-sm text-pink-600 font-semibold">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X (Twitter)
                </a>
              </div>
              {isConnected && (
                <button onClick={() => { disconnect(); }} className="mx-4 mt-1 flex items-center space-x-2 text-sm text-red-500 font-semibold">
                  <span>Disconnect {shortAddress}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </>
  );
}
