import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, Wallet, ChevronDown, Menu, X, CheckCircle2, ArrowLeftRight, FileText, Repeat, BarChart3, ShieldCheck } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import WalletModal from "@/components/WalletModal";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";

const TELEGRAM_URL = "https://t.me/barbiefunv2";
const TWITTER_URL = "https://x.com/Amanchain50";
const WHITEPAPER_URL = `${import.meta.env.BASE_URL}barbiefun-whitepaper.pdf`;

export default function Navbar() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const solana = useSolanaWallet();
  const [chainOpen, setChainOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const shortSolAddress = solana.publicKey ? `${solana.publicKey.slice(0, 4)}…${solana.publicKey.slice(-4)}` : "";
  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chain?.id);
  const anyConnected = isConnected || solana.connected;

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
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Home</Button>
                </Link>
                <Link href="/launch">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Launch</Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Portfolio</Button>
                </Link>
                <Link href="/bridge">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Bridge</Button>
                </Link>
                <Link href="/verify">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Verify</Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" className="text-pink-700 hover:text-pink-500 hover:bg-pink-50 font-semibold">Admin</Button>
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Social Icons */}
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors" title="Telegram">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </a>
              <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors" title="X (Twitter)">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-foreground"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href={WHITEPAPER_URL} target="_blank" rel="noopener noreferrer"
                className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors text-pink-600" title="Whitepaper">
                <FileText className="w-4 h-4" />
              </a>

              {/* Chain indicator (when EVM connected) */}
              {isConnected && currentChain && (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 text-sm font-semibold text-pink-700">
                  <ChainIcon chain={currentChain.icon} size={16} />
                  <span className="hidden lg:inline">{currentChain.name}</span>
                </div>
              )}
              {isConnected && !currentChain && (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700">
                  <span className="hidden lg:inline">Unsupported network</span>
                </div>
              )}
              {/* Solana connected indicator */}
              {solana.connected && !isConnected && (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-sm font-semibold text-purple-700">
                  <ChainIcon chain="x1" size={16} />
                  <span className="hidden lg:inline">{shortSolAddress}</span>
                </div>
              )}

              {/* Chain selector (when not connected) */}
              {!anyConnected && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setChainOpen(!chainOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 text-sm font-semibold text-pink-700 transition-colors"
                  >
                    <ChainIcon chain="bnb" size={16} />
                    <span className="hidden lg:inline">Chains</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {chainOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-pink-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="px-3 py-2 text-[10px] font-bold text-pink-400 uppercase tracking-widest bg-pink-50 border-b border-pink-100">
                        EVM Chains
                      </div>
                      {SUPPORTED_CHAINS.map((c) => (
                        <button key={c.id} onClick={() => setChainOpen(false)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-pink-50 transition-colors text-left text-gray-700">
                          <div className="flex items-center space-x-2">
                            <ChainIcon chain={c.icon} size={18} />
                            <span>{c.name}</span>
                          </div>
                          <span className="text-[10px] text-pink-400 font-bold">{c.symbol}</span>
                        </button>
                      ))}
                      <div className="px-3 py-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-50 border-y border-purple-100">
                        SVM Chains
                      </div>
                      {DISPLAY_CHAINS.filter((c) => c.isSvm).map((c) => (
                        <div key={c.id} className="flex items-center justify-between px-4 py-2.5 text-sm text-purple-600">
                          <div className="flex items-center space-x-2">
                            <ChainIcon chain={c.icon} size={18} />
                            <span>{c.name}</span>
                          </div>
                          <span className="text-[9px] bg-purple-100 text-purple-600 rounded px-1.5 font-bold">SVM</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Shortcut buttons */}
              <Link href="/bridge" className="hidden sm:block">
                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors text-pink-600" title="Bridge Assets">
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/swap" className="hidden sm:block">
                <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50 font-bold rounded-full px-4 shadow-sm hover:shadow-md transition-all">
                  <Repeat className="w-4 h-4 mr-1.5" />
                  <span>Swap</span>
                </Button>
              </Link>
              <Link href="/launch" className="hidden sm:block">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-4 shadow-md hover:shadow-lg transition-all">
                  <Rocket className="w-4 h-4 mr-1.5" />
                  <span className="hidden lg:inline">Launch Token</span>
                  <span className="lg:hidden">Launch</span>
                </Button>
              </Link>

              {/* Wallet Button */}
              {anyConnected ? (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="wallet-btn px-4 py-2 rounded-full text-sm font-bold border-2 border-pink-300 shadow-md hover:shadow-pink-300/50 transition-all"
                >
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-pink-700" />
                    <span className="hidden sm:inline font-mono">
                      {isConnected ? shortAddress : shortSolAddress}
                    </span>
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
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Home</div>
              </Link>
              <Link href="/launch" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Launch Token</div>
              </Link>
              <Link href="/portfolio" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" /><span>Portfolio</span>
                </div>
              </Link>
              <Link href="/swap" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Swap</div>
              </Link>
              <Link href="/bridge" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Bridge Assets</div>
              </Link>
              <Link href="/verify" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700">Verify Token</div>
              </Link>
              <Link href="/admin" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" /><span>Admin</span>
                </div>
              </Link>
              <a href={WHITEPAPER_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-2.5 rounded-lg hover:bg-pink-50 font-semibold text-pink-700 flex items-center space-x-2">
                  <FileText className="w-4 h-4" /><span>Whitepaper</span>
                </div>
              </a>
              <div className="px-4 py-2 flex items-center space-x-4">
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 text-sm text-pink-600 font-semibold">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
                <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 text-sm text-pink-600 font-semibold">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X (Twitter)
                </a>
              </div>
              {anyConnected && (
                <button onClick={() => { disconnect(); solana.disconnect(); }} className="mx-4 mt-1 flex items-center space-x-2 text-sm text-red-500 font-semibold">
                  <span>Disconnect</span>
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
