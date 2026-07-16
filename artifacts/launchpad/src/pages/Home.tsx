import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Rocket, Clock, Trophy, ArrowLeftRight, Sparkles, DollarSign, Link2, Heart, BadgeCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import RecentLaunches from "@/components/RecentLaunches";
import TokenCard from "@/components/TokenCard";
import NativeTokenPrices from "@/components/NativeTokenPrices";
import X1TokenTracker from "@/components/X1TokenTracker";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import { useLaunches } from "@/hooks/useLaunches";

const TELEGRAM_URL = "https://t.me/barbiefunv2/65";
const TWITTER_URL = "https://x.com/BARBIEFUNV2";

export default function Home() {
  const [tab, setTab] = useState("new");
  const [search, setSearch] = useState("");
  const { data: launches = [], isLoading } = useLaunches();

  const getFiltered = () => {
    switch (tab) {
      case "new":
        return [...launches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "chains":
        return [...launches].sort((a, b) => a.chainName.localeCompare(b.chainName));
      case "verified":
        return [...launches]
          .filter((l) => l.verified)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return launches;
    }
  };

  const query = search.trim().toLowerCase();
  const filteredLaunches = getFiltered().filter((l) => {
    if (!query) return true;
    return l.name.toLowerCase().includes(query) || l.deployer.toLowerCase().includes(query);
  });

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
      <section className="relative rounded-3xl overflow-hidden border border-pink-200/60 shadow-xl mt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-rose-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(236,72,153,0.15)_0%,_transparent_60%)]" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-start justify-between gap-8">
          <div className="w-full lg:max-w-md text-center lg:text-left shrink-0">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-5">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src="/logo.png"
                  alt="Barbie Fun"
                  className="w-14 h-14 rounded-full object-cover border-2 border-pink-300/60 shadow-lg shadow-pink-200/60"
                />
              </motion.div>
              <div className="inline-flex items-center bg-pink-100 border border-pink-300/60 rounded-full px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 mr-1.5" />
                <span className="text-pink-500 text-xs font-bold uppercase tracking-wider">Fair Launch Protocol</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-pink-400 mb-2">
                We Introduce
              </p>
              <h1 className="text-5xl sm:text-6xl font-black leading-none tracking-tight mb-1">
                <span
                  className="block"
                  style={{
                    background: "linear-gradient(135deg, #ec4899 0%, #db2777 40%, #f472b6 70%, #db2777 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 2px 8px rgba(236,72,153,0.35))",
                  }}
                >
                  BARBIE
                </span>
                <span
                  className="block"
                  style={{
                    background: "linear-gradient(135deg, #be185d 0%, #ec4899 50%, #db2777 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 2px 12px rgba(244,63,94,0.4))",
                    letterSpacing: "0.08em",
                  }}
                >
                  FUN
                </span>
              </h1>
            </div>

            <p className="text-sm text-pink-600/80 font-semibold mb-4 italic">
              Own by nobody &mdash; zero team, only Barbie&apos;s.
            </p>

            <div className="relative inline-block mb-7">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 rounded-2xl blur-md opacity-40 scale-105" />
              <div className="relative bg-gradient-to-r from-pink-400 via-pink-500 to-pink-400 rounded-2xl px-5 py-2.5 shadow-lg flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 text-white" />
                <span className="text-white font-black text-lg sm:text-xl tracking-widest uppercase drop-shadow">
                  Start Launching
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link href="/launch">
                <Button size="lg" className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:from-pink-500 hover:via-pink-600 hover:to-pink-700 text-white font-bold px-8 rounded-full shadow-lg hover:shadow-pink-300/60 transition-all">
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch a Token
                </Button>
              </Link>
              <Link href="/bridge">
                <Button size="lg" variant="outline" className="border-2 border-pink-300/60 text-pink-600 font-bold px-6 rounded-full">
                  <ArrowLeftRight className="w-5 h-5 mr-2" />
                  Bridge Assets
                </Button>
              </Link>
            </div>
          </div>

          {/* Native Token Prices — replaces Live Terminal */}
          <div className="w-full lg:flex-1 min-w-0">
            <NativeTokenPrices />
          </div>
        </div>

        {/* Chain badges strip */}
        <div className="relative z-10 border-t border-pink-100 bg-white/60 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-xs text-pink-400 font-bold uppercase tracking-widest mr-2">Supported Chains</span>
            {DISPLAY_CHAINS.map((chain) => (
              <div
                key={chain.id}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm transition-all cursor-default ${
                  chain.isSvm
                    ? "bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-700 hover:border-purple-400"
                    : "bg-white border border-pink-100 text-pink-800 hover:border-pink-300/60"
                }`}
                title={`Native token: ${chain.tokenName} (${chain.symbol})`}
              >
                <ChainIcon chain={chain.icon} size={16} />
                <span>{chain.name}</span>
                <span className={`text-[11px] font-black border-l pl-2 ${chain.isSvm ? "border-purple-200 text-purple-500" : "border-pink-100 text-pink-400"}`}>
                  {chain.symbol}
                </span>
                {chain.isSvm && (
                  <span className="text-[9px] font-bold bg-purple-200 text-purple-700 rounded-full px-1.5 py-0.5 leading-none">SVM</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tokens Launched", value: launches.length.toLocaleString(), icon: Rocket },
          { label: "Launch Fee", value: "$5 flat", icon: DollarSign },
          { label: "EVM Chains", value: String(SUPPORTED_CHAINS.length), icon: Link2 },
          { label: "SVM Chains", value: "X1 · Solana", icon: ArrowLeftRight },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-pink-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:border-pink-200/60 transition-all">
            <stat.icon className="w-6 h-6 text-pink-500 mx-auto mb-1.5" />
            <div className="text-xl font-extrabold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* X1 Token Tracker */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <ChainIcon chain="x1" size={20} />
          <h2 className="text-xl font-extrabold text-pink-900">X1 Blockchain Tokens</h2>
          <span className="text-[10px] font-bold bg-pink-100 text-pink-600 border border-pink-200/60 rounded-full px-2 py-0.5 uppercase tracking-widest">Live</span>
        </div>
        <X1TokenTracker />
      </section>

      {/* Recently Launched */}
      <RecentLaunches launches={launches} />

      {/* Token Feed */}
      <section>
        <Tabs defaultValue="new" value={tab} onValueChange={setTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 bg-clip-text text-transparent">Discovery</span>
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-pink-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or contract address"
                className="pl-10 border-pink-200/60 focus-visible:ring-pink-300 rounded-full"
              />
            </div>
          </div>
          <div className="flex justify-end mb-6">
            <TabsList className="bg-pink-50 border border-pink-200/60 rounded-full p-1 w-full sm:w-auto">
              <TabsTrigger value="new" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-pink-600 font-semibold">
                <Clock className="w-3.5 h-3.5 mr-1.5" />New
              </TabsTrigger>
              <TabsTrigger value="chains" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-pink-600 font-semibold">
                <Trophy className="w-3.5 h-3.5 mr-1.5" />By Chain
              </TabsTrigger>
              <TabsTrigger value="verified" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-pink-600 font-semibold">
                <BadgeCheck className="w-3.5 h-3.5 mr-1.5" />Verified
              </TabsTrigger>
            </TabsList>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-pink-100 rounded w-3/4" />
                      <div className="h-2.5 bg-pink-50 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-2 bg-pink-50 rounded" />
                  <div className="h-2 bg-pink-50 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredLaunches.length === 0 ? (
            <div className="bg-white border border-dashed border-pink-200/60 rounded-2xl py-16 px-6 text-center">
              {query ? (
                <>
                  <Search className="w-8 h-8 text-pink-200 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-pink-800 mb-1">No matches found</h3>
                  <p className="text-sm text-pink-400 mb-5 max-w-sm mx-auto">
                    No tokens match &quot;{search}&quot; by name or contract address.
                  </p>
                </>
              ) : tab === "verified" ? (
                <>
                  <BadgeCheck className="w-8 h-8 text-pink-200 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-pink-800 mb-1">No verified tokens yet</h3>
                  <p className="text-sm text-pink-400 mb-5 max-w-sm mx-auto">
                    Verified tokens have passed a team review for legitimacy and trust.
                  </p>
                  <Link href="/verify">
                    <Button className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white font-bold rounded-full">
                      <BadgeCheck className="w-4 h-4 mr-2" />Apply for Verification
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Rocket className="w-8 h-8 text-pink-200 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-pink-800 mb-1">No tokens launched yet</h3>
                  <p className="text-sm text-pink-400 mb-5 max-w-sm mx-auto">
                    Be the first to launch a token on Barbie Fun — pick a chain, pay the $5 fee, and your launch will show up here.
                  </p>
                  <Link href="/launch">
                    <Button className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white font-bold rounded-full">
                      <Rocket className="w-4 h-4 mr-2" />Launch the First Token
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredLaunches.map((launch) => (
                  <motion.div key={launch.id} variants={item}>
                    <TokenCard launch={launch} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </Tabs>
      </section>

      {/* Community Section */}
      <motion.section
        className="relative overflow-hidden rounded-3xl text-white text-center shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-400 via-fuchsia-500 to-pink-600"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />

        {/* Floating sparkle blobs */}
        {[
          { top: "10%", left: "5%", size: 80, delay: 0 },
          { top: "60%", left: "90%", size: 60, delay: 1.2 },
          { top: "75%", left: "12%", size: 50, delay: 0.6 },
          { top: "20%", left: "80%", size: 70, delay: 1.8 },
        ].map((blob, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{ top: blob.top, left: blob.left, width: blob.size, height: blob.size }}
            animate={{ y: [0, -18, 0], scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: blob.delay, ease: "easeInOut" }}
          />
        ))}

        <div className="relative z-10 p-8 sm:p-14">
          {/* Hero image */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.img
              src="/barbie-fun-banner.png"
              alt="Barbie Fun"
              className="w-52 sm:w-64 rounded-3xl shadow-2xl ring-4 ring-white/30"
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Headline with shimmer */}
          <motion.h2
            className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            Join the Barbie Community
          </motion.h2>

          <motion.p
            className="text-pink-100 text-lg mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Connect with thousands of degens on Telegram and X. Get alpha, token launches, and Barbie vibes. 💕
          </motion.p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {/* Telegram button */}
            <motion.a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }, scale: { type: "spring", stiffness: 300 } }}
            >
              <span className="flex items-center space-x-2 bg-white text-pink-600 font-bold px-7 py-3.5 rounded-full shadow-lg text-base">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#229ED9]">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Join Telegram</span>
              </span>
            </motion.a>

            {/* X / Twitter button */}
            <motion.a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ y: { duration: 2.2, repeat: Infinity, delay: 0.6, ease: "easeInOut" }, scale: { type: "spring", stiffness: 300 } }}
            >
              <span className="flex items-center space-x-2 bg-white text-pink-600 font-bold px-7 py-3.5 rounded-full shadow-lg text-base">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Follow on X</span>
              </span>
            </motion.a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
