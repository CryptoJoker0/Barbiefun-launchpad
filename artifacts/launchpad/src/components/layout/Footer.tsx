import { useState } from "react";
import { Link } from "wouter";
import { Copy, CheckCircle2, Mail, ExternalLink, Heart } from "lucide-react";

const EMAIL = "barbiefunlaunchpad@gmail.com";
const TELEGRAM = "https://t.me/barbiefunv2/65";
const TWITTER = "https://x.com/BARBIEFUNV2";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const copyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-pink-100 bg-white/80 backdrop-blur mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Barbie Fun" className="w-8 h-8 rounded-full object-cover border border-pink-300/60" />
              <span className="font-extrabold text-lg bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 bg-clip-text text-transparent">
                Barbie Fun
              </span>
            </div>
            <p className="text-xs text-pink-400 leading-relaxed max-w-xs">
              Fair-launch token protocol across 6 EVM chains + 2 SVM chains.
              Own by nobody — zero team, only Barbie's.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <a href={TELEGRAM} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 hover:bg-pink-100 flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#229ED9]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href={TWITTER} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 hover:bg-pink-100 flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-pink-900"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-bold text-pink-600/80 uppercase tracking-widest mb-4">Platform</p>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Launch Token", href: "/launch" },
                { label: "Bridge Assets", href: "/bridge" },
                { label: "Swap", href: "/swap" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Get Verified", href: "/verify" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-pink-600/80 hover:text-pink-500 font-medium transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-bold text-pink-600/80 uppercase tracking-widest mb-4">Resources</p>
            <ul className="space-y-2">
              {[
                { label: "Whitepaper", href: `${import.meta.env.BASE_URL}barbiefun-whitepaper.pdf`, external: true },
                { label: "Contact", href: "/contact" },
                { label: "x1scr.xyz", href: "https://x1scr.xyz", external: true },
                { label: "X1 Oracle", href: "https://x1oracle.com", external: true },
                { label: "FortiBlox Explorer", href: "https://explorer.fortiblox.com", external: true },
              ].map(({ label, href, external }) => (
                <li key={href}>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-pink-600/80 hover:text-pink-500 font-medium transition-colors flex items-center gap-1">
                      {label} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link href={href} className="text-sm text-pink-600/80 hover:text-pink-500 font-medium transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold text-pink-600/80 uppercase tracking-widest mb-4">Contact</p>
            <div className="space-y-3">
              <p className="text-xs text-pink-400">Official email</p>
              <div className="flex items-center gap-2 bg-pink-50 border border-pink-200/60 rounded-xl px-3 py-2.5">
                <Mail className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <a href={`mailto:${EMAIL}`} className="text-xs font-mono text-pink-600 hover:text-pink-700 truncate flex-1 font-semibold">
                  {EMAIL}
                </a>
                <button onClick={copyEmail} title="Copy email"
                  className="shrink-0 text-pink-400 hover:text-pink-600 transition-colors">
                  {copied
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    : <Copy className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
              <p className="text-xs text-pink-400">Replies within 24-48 hours.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-pink-400">
          <p>© {new Date().getFullYear()} Barbie Fun. Zero team, only Barbie&apos;s.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-pink-400 fill-pink-400" /> for the community
          </p>
        </div>
      </div>
    </footer>
  );
}
