import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./WelcomeOverlay.css";

const COVER_ART_SOURCE =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000fdf882119e952cb8becac9ad-XG5dcyB8nvI2vMgh1eOSjG9afcTscm.png";
const COVER_ART_FALLBACK = `${import.meta.env.BASE_URL}images/barbiefun-launchpad-cover.png`;
const LOGO_SOURCE = `${import.meta.env.BASE_URL}logo.png`;

interface WelcomeOverlayProps {
  onConnect: () => void;
}

export default function WelcomeOverlay({ onConnect }: WelcomeOverlayProps) {
  const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  const hasEnteredRef = useRef(false);
  const [isEntering, setIsEntering] = useState(false);
  const [coverSource, setCoverSource] = useState(COVER_ART_SOURCE);
  const [coverUnavailable, setCoverUnavailable] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    connectButtonRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      connectButtonRef.current?.focus();
    }
  };

  const handleCoverError = () => {
    if (coverSource !== COVER_ART_FALLBACK) {
      setCoverSource(COVER_ART_FALLBACK);
      return;
    }

    setCoverUnavailable(true);
  };

  const handleConnect = () => {
    if (hasEnteredRef.current) return;

    hasEnteredRef.current = true;
    setIsEntering(true);
    onConnect();
  };

  return (
    <section
      className="welcome-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="barbiefun-welcome-title"
      aria-describedby="barbiefun-welcome-description"
      onKeyDown={handleKeyDown}
      data-testid="barbiefun-welcome"
    >
      <div className="welcome-artwork">
        {coverUnavailable ? (
          <div
            className="welcome-art-fallback"
            role="img"
            aria-label="BarbieFun welcome artwork unavailable"
          />
        ) : (
          <img
            src={coverSource}
            alt="Official BarbieFun cover artwork featuring a crown and two characters in a neon-pink and black setting."
            onError={handleCoverError}
            decoding="async"
          />
        )}
      </div>
      <div className="welcome-frame" aria-hidden="true" />

      <div className="welcome-layout">
        <div className="welcome-content">
          <div className="welcome-brand">
            <img className="welcome-logo" src={LOGO_SOURCE} alt="BarbieFun logo" />
            <div className="welcome-brand-copy">
              <p className="welcome-kicker">WELCOME TO BARBIEFUN</p>
              <p className="welcome-brand-caption">A COMMUNITY-POWERED WEB3 EXPERIENCE</p>
            </div>
          </div>

          <div className="welcome-message">
            <p className="welcome-overline">MULTI-CHAIN · COMMUNITY · OPPORTUNITY</p>
            <h1 className="welcome-title" id="barbiefun-welcome-title" aria-label="BARBIEFUN MULTI CHAIN LAUNCHPAD">
              <span>BARBIEFUN</span>
              <span className="welcome-title-accent">MULTI CHAIN</span>
              <span>LAUNCHPAD</span>
            </h1>
            <p className="welcome-description" id="barbiefun-welcome-description">
              “Discover the next generation of multichain launches, Web3 gaming, staking, and community-powered opportunities.”
            </p>
            <Button
              ref={connectButtonRef}
              type="button"
              size="lg"
              disabled={isEntering}
              aria-busy={isEntering}
              onClick={handleConnect}
              className="welcome-connect-button w-full max-w-[24rem] min-h-14 rounded-full border border-white/40 bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 px-6 text-base font-extrabold tracking-[0.12em] text-[#170711] shadow-[0_12px_40px_rgba(255,70,180,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_48px_rgba(255,70,180,0.48)] focus-visible:ring-4 focus-visible:ring-pink-200 focus-visible:ring-offset-4 focus-visible:ring-offset-[#09050d] sm:w-auto"
              data-testid="connect-launchpad"
            >
              <span>CONNECT LAUNCHPAD</span>
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            <p className="welcome-footnote">Your wallet connects inside the launchpad.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
