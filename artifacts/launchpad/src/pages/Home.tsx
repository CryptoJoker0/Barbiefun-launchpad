import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Rocket, Flame, Clock, Trophy, BadgeCheck, Send } from "lucide-react";
import TokenCard from "@/components/TokenCard";
import { mockTokens } from "@/lib/mock-data";

const CHAINS = [
  { name: "BNB Chain", symbol: "BNB", emoji: "🟡", color: "#F0B90B" },
  { name: "Ethereum", symbol: "ETH", emoji: "🔷", color: "#627EEA" },
  { name: "X1", symbol: "X1", emoji: "🟠", color: "#FF6B35" },
  { name: "Tempo", symbol: "TEMPO", emoji: "🟣", color: "#9B59B6" },
  { name: "Arc Mainnet", symbol: "ARC", emoji: "🟢", color: "#1ABC9C" },
  { name: "Robinhood", symbol: "RHN", emoji: "🟩", color: "#00C805" },
];

export default function Home() {
  const [tab, setTab] = useState("new");

  const getTokens = () => {
    switch (tab) {
      case "new":
        return [...mockTokens].sort((a, b) => new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime());
      case "trending":
        return [...mockTokens].sort((a, b) => b.volume24h - a.volume24h);
      case "top":
        return [...mockTokens].sort((a, b) => b.marketCap - a.marketCap);
      case "verified":
        return mockTokens.filter(t => t.isVerified);
      default:
        return mockTokens;
    }
  };

  const filteredTokens = getTokens();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden border border-pink-200 shadow-xl mt-4">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-rose-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(236,72,153,0.15)_0%,_transparent_60%)]" />

        <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-pink-100 border border-pink-300 rounded-full px-4 py-1.5 mb-6">
              <span className="text-pink-500 text-sm font-bold uppercase tracking-wider">✨ Fair Launch Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              <span className="bg-gradient-to-r from-pink-500 via-red-400 to-pink-600 bg-clip-text text-transparent">
                WE INTRODUCE
              </span>
              <br />
              <span className="text-foreground">BARBIE FUN</span>
            </h1>

            <p className="text-base sm:text-lg text-pink-700 font-semibold mb-2">
              OWN BY NOBODY, ZERO TEAM ONLY BARBIE&apos;S.
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-pink-500 mb-8 tracking-wide">
              START LAUNCHING 🚀
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link href="/launch">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold text-base px-8 h-13 rounded-full shadow-lg hover:shadow-pink-300/60 transition-all">
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch a Token
                </Button>
              </Link>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 font-bold rounded-full h-13 px-6">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </Button>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 font-bold rounded-full h-13 px-6">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Follow on X
                </Button>
              </a>
            </div>
          </div>

          {/* Floating logo */}
          <div className="hidden md:block relative shrink-0">
            <div className="w-52 h-52 bg-pink-200/60 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src="/logo.png"
                alt="Barbie Fun"
                className="w-44 h-44 rounded-full object-cover border-4 border-pink-300 shadow-2xl shadow-pink-300/50"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                LIVE 🔴
              </div>
            </motion.div>
          </div>
        </div>

        {/* Chain badges strip */}
        <div className="relative z-10 border-t border-pink-100 bg-white/60 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-xs text-pink-400 font-bold uppercase tracking-widest mr-2">Supported Chains</span>
            {CHAINS.map((chain) => (
              <div
                key={chain.symbol}
                className="flex items-center space-x-1.5 bg-white border border-pink-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm hover:border-pink-300 transition-colors cursor-default"
              >
                <span>{chain.emoji}</span>
                <span>{chain.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tokens Launched", value: "12,483", icon: "🚀" },
          { label: "Total Volume", value: "$48.2M", icon: "💰" },
          { label: "Active Traders", value: "92,104", icon: "👾" },
          { label: "Chains Supported", value: "6", icon: "⛓️" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-pink-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:border-pink-200 transition-all">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-extrabold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Token Feed */}
      <section>
        <Tabs defaultValue="new" value={tab} onValueChange={setTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-pink-500 to-red-400 bg-clip-text text-transparent">Discovery</span>
            </h2>
            <TabsList className="bg-pink-50 border border-pink-200 rounded-full p-1 w-full sm:w-auto">
              <TabsTrigger value="new" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-pink-600 font-semibold">
                <Clock className="w-3.5 h-3.5 mr-1.5" />New
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-pink-600 font-semibold">
                <Flame className="w-3.5 h-3.5 mr-1.5" />Trending
              </TabsTrigger>
              <TabsTrigger value="top" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-pink-600 font-semibold">
                <Trophy className="w-3.5 h-3.5 mr-1.5" />Top
              </TabsTrigger>
              <TabsTrigger value="verified" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-pink-600 font-semibold">
                <BadgeCheck className="w-3.5 h-3.5 mr-1.5" />Verified
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredTokens.map((token) => (
                <motion.div key={token.id} variants={item}>
                  <TokenCard token={token} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </section>

      {/* Community Section */}
      <section className="rounded-3xl bg-gradient-to-r from-pink-500 via-red-400 to-pink-600 p-8 sm:p-12 text-white text-center shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Join the Barbie&apos;s Community 💕</h2>
        <p className="text-pink-100 text-lg mb-8 max-w-xl mx-auto">
          Connect with thousands of degens on Telegram and X. Get alpha, token launches, and Barbie vibes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="https://t.me" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center space-x-2 bg-white text-pink-600 font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              <span>Telegram</span>
            </button>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center space-x-2 bg-white text-pink-600 font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>Follow on X</span>
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
