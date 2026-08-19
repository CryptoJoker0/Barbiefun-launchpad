import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Rocket, Clock, Trophy, ArrowLeftRight, Sparkles, DollarSign, Link2, Heart, BadgeCheck, Search, Radio, ShieldCheck, Cpu, Zap, Globe, Users, ExternalLink, Video, Clipboard, Check, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import RecentLaunches from "@/components/RecentLaunches";
import TokenCard from "@/components/TokenCard";
import NativeTokenPrices from "@/components/NativeTokenPrices";
import X1TokenTracker from "@/components/X1TokenTracker";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import { useLaunches } from "@/hooks/useLaunches";
import { useLiveStream } from "@/hooks/useLiveStream";

const TELEGRAM_URL = "https://t.me/barbiefunv2/65";
const TWITTER_URL = "https://x.com/BARBIEFUNV2";
const VALIDATOR_VOTE_ACCOUNT = "BhoHtTEp56AvhGM4qAe6rujVjYwVB8NGXE3z8CJFTBLE";
const VALIDATOR_STAKING_URL = "https://app.xdex.xyz/valistake";

export default function Home() {
  const [tab, setTab] = useState("new");
  const [search, setSearch] = useState("");
  const [validatorCopied, setValidatorCopied] = useState(false);
  const { data: launches = [], isLoading } = useLaunches();
  const { data: liveStream } = useLiveStream();
  // Use API-configured video/embed if available, otherwise fall back to the
  // locally-served video uploaded directly to the public folder.
  const LOCAL_VIDEO = `${import.meta.env.BASE_URL}live-video.mp4`;
  const videoUrl = liveStream?.videoObjectPath
    ? `/api/storage${liveStream.videoObjectPath}`
    : LOCAL_VIDEO;
  const hasLivePlayer = Boolean(liveStream?.embedUrl || videoUrl);
  // True when we have something to play (API stream or local video)
  const isOnAir = liveStream?.isLive || hasLivePlayer;

  const copyValidatorVoteAccount = async () => {
    try {
      await navigator.clipboard.writeText(VALIDATOR_VOTE_ACCOUNT);
      setValidatorCopied(true);
      window.setTimeout(() => setValidatorCopied(false), 2200);
    } catch {
      window.alert("Unable to copy the vote account. Please copy it manually.");
    }
  };

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
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 rounded-2xl blur-md opacity-40 scale-105" />
              <div className="relative bg-gradient-to-r from-pink-400 via-pink-500 to-pink-400 rounded-2xl px-5 py-2.5 shadow-lg flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 text-white" />
                <span className="text-white font-black text-lg sm:text-xl tracking-widest uppercase drop-shadow">
                  Start Launching
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link href="/launch">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 text-white font-bold px-8 rounded-full shadow-lg hover:shadow-pink-300/60 transition-all">
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

      {/* African X1 NFT — Guardian Banner */}
      <motion.a
        href="https://african-x-1-nft--africamarket.replit.app"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="block relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer group"
      >
        {/* Full-bleed NFT image */}
        <img
          src="/african-nft.jpg"
          alt="African X1 NFT — Genesis Collection"
          className="w-full h-64 sm:h-80 object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Animated glow ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{ boxShadow: ["0 0 0px 0px rgba(251,191,36,0)", "0 0 32px 6px rgba(251,191,36,0.45)", "0 0 0px 0px rgba(251,191,36,0)"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center">
          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-300 text-[10px] font-bold uppercase tracking-widest">African X1 · Genesis Collection · X1 Chain</span>
          </div>

          {/* CTA text */}
          <motion.h3
            className="text-white font-black text-2xl sm:text-3xl uppercase tracking-wide drop-shadow-lg mb-5"
            style={{ textShadow: "0 0 24px rgba(251,191,36,0.7)" }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            🌍 Click to Become a Guardian
          </motion.h3>

          {/* Buy button */}
          <motion.div
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black font-extrabold text-sm sm:text-base px-8 py-3 rounded-full shadow-lg shadow-amber-500/40"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
            whileHover={{ y: -2 }}
          >
            <span className="text-lg">🔘</span>
            Buy African X1 NFT
            <ExternalLink className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.a>

      {/* Recently Launched */}
      <RecentLaunches launches={launches} />

      {/* Token Feed */}
      <section>
        <Tabs defaultValue="new" value={tab} onValueChange={setTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 bg-clip-text text-transparent">Discovery</span>
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
                    <Button className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-bold rounded-full">
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
                    <Button className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-bold rounded-full">
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

      {/* Live Stream Section — X1 Exclusive */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d0820 40%, #12091a 100%)" }}
      >
        {/* Ambient glow blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          className="absolute top-10 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Live pulse icon */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/40">
              <Radio className="w-5 h-5 text-white" />
              {isOnAir && (
                <>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-extrabold text-white tracking-tight">Barbie Fun Live</h2>
                <span className={`text-[9px] font-black text-white rounded-full px-2 py-0.5 uppercase tracking-widest ${liveStream?.isLive ? "bg-red-500 shadow-sm shadow-red-500/60" : isOnAir ? "bg-fuchsia-600 shadow-sm shadow-fuchsia-500/50" : "bg-white/10"}`}>
                  {liveStream?.isLive ? "🔴 Live" : isOnAir ? "▶ On Air" : "Offline"}
                </span>
              </div>
              <p className="text-[11px] text-white/40 font-medium">Token launches · Alpha calls · Community events</p>
            </div>
          </div>

          {/* X1 Exclusive badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-purple-500/40 bg-purple-500/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <ChainIcon chain="x1" size={14} />
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">X1 Projects Only</span>
              <ShieldCheck className="w-3 h-3 text-purple-400" />
            </div>
            {hasLivePlayer && (
              <a href="#live-player"
                className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition-all shadow-md shadow-pink-500/30">
                <Radio className="w-3 h-3" /> Watch Live
              </a>
            )}
          </div>
        </div>

        {/* Player or offline state */}
        {hasLivePlayer ? (
          <div id="live-player" className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
            {videoUrl ? (
              <video controls playsInline
                className="absolute inset-0 w-full h-full object-contain"
                aria-label={liveStream?.videoTitle || liveStream?.title || "Barbie Fun video"}>
                <source src={videoUrl} />
              </video>
            ) : (
              <iframe
                src={liveStream?.embedUrl || undefined}
                title={liveStream?.title || "Barbie Fun Live Stream"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>
        ) : (
          <div className="relative z-10 px-6 py-16 text-center">
            {/* Animated screen icon */}
            <motion.div
              className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-6 mx-auto"
              animate={{ boxShadow: ["0 0 0px 0px rgba(236,72,153,0)", "0 0 24px 4px rgba(236,72,153,0.3)", "0 0 0px 0px rgba(236,72,153,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Video className="w-9 h-9 text-pink-400" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </span>
            </motion.div>

            <h3 className="text-xl font-extrabold text-white mb-2">No stream scheduled right now</h3>
            <p className="text-sm text-white/40 max-w-sm mx-auto mb-2">
              This stage is reserved exclusively for <span className="text-purple-400 font-bold">X1 Blockchain projects</span> — token launches, alpha calls & live AMAs.
            </p>

            {/* X1-only rule */}
            <div className="inline-flex items-center gap-2 mt-3 mb-6 border border-purple-500/30 bg-purple-500/10 rounded-2xl px-5 py-3">
              <ChainIcon chain="x1" size={16} />
              <span className="text-xs text-purple-300 font-semibold">Only X1 projects are permitted to go live on this stage</span>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-full transition-all">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Follow for updates
              </a>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-full transition-all">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Join Telegram
              </a>
            </div>
          </div>
        )}

        {/* Footer bar */}
        <div className="relative z-10 border-t border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ChainIcon chain="x1" size={14} />
            <span className="text-[11px] text-white/50 font-semibold">Powered by X1 Blockchain · SVM</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] font-semibold transition-colors">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Follow on X
            </a>
            <a href={hasLivePlayer ? "#live-player" : undefined}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full transition-all ${hasLivePlayer ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-sm" : "text-white/20 cursor-default"}`}>
              <Radio className="w-3 h-3" />
              {hasLivePlayer ? "Watch Live" : "Offline"}
            </a>
          </div>
        </div>
      </motion.section>

      {/* BarbieFun Validator Section */}
      <motion.section
        id="validator"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm"
      >
        {/* Subtle animated BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-fuchsia-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500 mb-1">Official validator guide</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-900 leading-tight">Stake with BarbieFun <span className="text-pink-500">(X1)</span></h2>
                <p className="text-xs text-pink-400 font-semibold">Powered by X1 Blockchain · SVM</p>
              </div>
            </div>
            <a
              href={VALIDATOR_STAKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-md shadow-pink-200 transition-all hover:-translate-y-0.5 w-fit"
            >
              <Zap className="w-4 h-4" />
              Open staking portal
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="max-w-2xl text-sm text-pink-600/80 leading-relaxed mb-6">
            Join the BarbieFun Validator community through the official staking portal. Delegate your X1 stake directly to BarbieFun and help support a community-run block producer.
          </p>

          {/* Vote account */}
          <div className="rounded-2xl border border-pink-200 bg-white/80 p-4 sm:p-5 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Validator vote account</p>
                <p className="text-xs text-pink-500 mt-1">Copy this address into the official staking interface.</p>
              </div>
              <button
                type="button"
                onClick={copyValidatorVoteAccount}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold px-4 py-2 transition-colors shrink-0"
                aria-label="Copy validator vote account"
              >
                {validatorCopied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                {validatorCopied ? "Copied" : "Copy address"}
              </button>
            </div>
            <code className="block overflow-x-auto rounded-xl bg-pink-950 px-3 py-3 text-[11px] sm:text-xs text-pink-100 font-mono whitespace-nowrap">
              {VALIDATOR_VOTE_ACCOUNT}
            </code>
            {validatorCopied && <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Vote account copied to clipboard</p>}
          </div>

          {/* Validator stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: ShieldCheck, label: "Network",      value: "X1 Blockchain", sub: "SVM Mainnet" },
              { icon: Cpu,         label: "Role",         value: "Validator",      sub: "Block producer" },
              { icon: Globe,       label: "Status",       value: "Pending",        sub: "Awaiting activation", amber: true },
              { icon: Zap,         label: "Commission",   value: "0%",             sub: "No fees to stakers" },
            ].map(({ icon: Icon, label, value, sub, green, amber }: { icon: React.ElementType; label: string; value: string; sub: string; green?: boolean; amber?: boolean }) => (
              <div key={label} className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-pink-400 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                </div>
                <span className={`text-base font-extrabold leading-tight ${green ? "text-emerald-600" : amber ? "text-amber-500" : "text-pink-900"}`}>{value}</span>
                <span className="text-[11px] text-pink-400 font-medium">{sub}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-pink-100 pt-7">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-400">The process</p>
                <h3 className="text-lg font-extrabold text-pink-900 mt-1">How to join BarbieFun (X1)</h3>
              </div>
              <p className="text-xs text-pink-500">Five simple steps through the official portal.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
              {[
                ["01", "Copy vote account", "Copy the validator vote account shown above."],
                ["02", "Open staking portal", "Open the official staking portal in a new tab."],
                ["03", "Paste address", "Paste the copied vote account into the staking interface."],
                ["04", "Select BarbieFun", "Choose BarbieFun Validator (X1) as your validator."],
                ["05", "Stake", "Complete the staking process directly through the portal."],
              ].map(([number, title, body]) => (
                <div key={number} className="rounded-2xl bg-pink-50/80 border border-pink-100 p-4">
                  <span className="text-xs font-extrabold text-pink-400">{number}</span>
                  <h4 className="text-sm font-bold text-pink-900 mt-2 mb-1">{title}</h4>
                  <p className="text-[11px] text-pink-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why stake */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Heart,       title: "Community-run",  body: "BarbieFun runs its own validator to keep the X1 network decentralised and support the Barbie Fun ecosystem." },
              { icon: ShieldCheck, title: "Trusted & secure", body: "Operated with 24/7 monitoring, redundant infra, and slashing protection to keep your stake safe." },
              { icon: Zap,         title: "0% commission",  body: "100% of staking rewards flow straight to delegators — zero fees taken by the validator operator." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-gradient-to-br from-white to-pink-50 border border-pink-100 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-pink-500" />
                </div>
                <h3 className="font-bold text-pink-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-pink-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-pink-950 px-4 py-3.5 text-pink-100">
            <p className="text-[11px] leading-relaxed max-w-2xl">
              <strong className="text-white">Safety first.</strong> This page will never request or collect seed phrases, private keys, recovery phrases, or wallet passwords.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:text-white transition-colors">Follow on X</a>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold hover:text-white transition-colors"><Send className="w-3.5 h-3.5" /> Telegram</a>
            </div>
          </div>
        </div>
      </motion.section>

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
