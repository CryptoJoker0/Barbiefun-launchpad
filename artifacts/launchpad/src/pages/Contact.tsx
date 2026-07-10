import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Copy, CheckCircle2, ExternalLink, Heart, MessageCircle, Twitter } from "lucide-react";

const EMAIL = "barbiefunlaunchpad@gmail.com";
const TELEGRAM = "https://t.me/barbiefunv2";
const TWITTER = "https://x.com/Amanchain50";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 pb-24 animate-in fade-in duration-500 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 shadow-xl shadow-pink-200 mb-2"
        >
          <Mail className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-pink-600/80 max-w-md mx-auto text-lg">
          Have a question, partnership proposal, or need support? Reach us below — we're friendly.
        </p>
      </div>

      {/* Email card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-2 border-pink-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center border border-pink-200/60">
            <Mail className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest">Email</p>
            <p className="font-bold text-pink-900">Official Contact</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-pink-50 border border-pink-200/60 rounded-2xl p-4">
          <a
            href={`mailto:${EMAIL}`}
            className="font-mono font-bold text-pink-600 text-lg flex-1 hover:text-pink-700 transition-colors truncate"
          >
            {EMAIL}
          </a>
          <button
            onClick={copyEmail}
            className={`shrink-0 flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-all ${
              copied
                ? "bg-emerald-400 text-white"
                : "bg-pink-500 hover:bg-pink-600 text-white"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>

        <p className="text-sm text-pink-400 mt-3 text-center">
          We typically reply within 24-48 hours.
        </p>
      </motion.div>

      {/* Community */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-3xl p-8 shadow-sm"
      >
        <h2 className="text-xl font-extrabold text-pink-900 mb-2 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          Community
        </h2>
        <p className="text-sm text-pink-600/80 mb-6">
          Join thousands of Barbie&apos;s degens — get token launches, alpha, and Barbie vibes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-pink-100 rounded-2xl p-4 hover:border-pink-300/60 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-[#229ED9]" />
            </div>
            <div>
              <p className="font-bold text-pink-900 text-sm">Telegram</p>
              <p className="text-xs text-pink-400">@barbiefunv2</p>
            </div>
            <ExternalLink className="w-4 h-4 text-pink-300 group-hover:text-pink-400 ml-auto transition-colors" />
          </a>

          <a
            href={TWITTER}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-pink-100 rounded-2xl p-4 hover:border-pink-300/60 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50/50 flex items-center justify-center shrink-0">
              <Twitter className="w-5 h-5 text-pink-900" />
            </div>
            <div>
              <p className="font-bold text-pink-900 text-sm">X (Twitter)</p>
              <p className="text-xs text-pink-400">@Amanchain50</p>
            </div>
            <ExternalLink className="w-4 h-4 text-pink-300 group-hover:text-pink-400 ml-auto transition-colors" />
          </a>
        </div>
      </motion.div>

      {/* FAQ snippets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-pink-100 rounded-3xl p-8 shadow-sm"
      >
        <h2 className="text-xl font-extrabold text-pink-900 mb-6">Common Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "How do I launch a token?",
              a: "Go to the Launch page, choose your chain, fill in token details, and pay the $5 fee.",
            },
            {
              q: "How do I get verified?",
              a: "Go to Verify, choose Standard ($80) or Fast-Track ($100), fill in your project details, and pay the fee.",
            },
            {
              q: "Which wallets are supported?",
              a: "EVM: MetaMask, Coinbase Wallet, WalletConnect. SVM (X1 / Solana): Phantom, Backpack.",
            },
            {
              q: "What blockchains are supported?",
              a: "BNB Smart Chain, Base, X Layer, Tempo, Arc Mainnet, Robinhood Chain, X1 Blockchain, and Solana.",
            },
          ].map((item) => (
            <div key={item.q} className="border-b border-pink-50 pb-4 last:border-0 last:pb-0">
              <p className="font-bold text-pink-900 text-sm mb-1">{item.q}</p>
              <p className="text-sm text-pink-600/80">{item.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
