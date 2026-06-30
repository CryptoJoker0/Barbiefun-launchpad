import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Rocket, Flame, Clock, Trophy, BadgeCheck } from "lucide-react";
import TokenCard from "@/components/TokenCard";
import { mockTokens } from "@/lib/mock-data";

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
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-card border border-border p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between mt-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            The next <span className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">1000x</span> starts here.
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl">
            Launch your meme token in seconds. No coding required. Fair launch, locked liquidity, absolute degeneracy.
          </p>
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <Link href="/launch">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 h-14">
                <Rocket className="w-5 h-5 mr-2" />
                Launch a Token
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-8 md:mt-0 hidden md:block">
          <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_0_50px_rgba(16,185,129,0.3)] border-2 border-primary/50 flex items-center justify-center rotate-12"
          >
            <Rocket className="w-24 h-24 text-primary-foreground" />
          </motion.div>
        </div>
      </section>

      {/* Main Feed */}
      <section>
        <Tabs defaultValue="new" value={tab} onValueChange={setTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Discovery</h2>
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="new" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Clock className="w-4 h-4 mr-2" />New</TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Flame className="w-4 h-4 mr-2" />Trending</TabsTrigger>
              <TabsTrigger value="top" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Trophy className="w-4 h-4 mr-2" />Top</TabsTrigger>
              <TabsTrigger value="verified" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BadgeCheck className="w-4 h-4 mr-2" />Verified</TabsTrigger>
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
    </div>
  );
}
