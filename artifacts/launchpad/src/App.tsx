import { useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useReferral } from "@/hooks/useReferral";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Launch from "@/pages/Launch";
import TokenDetail from "@/pages/TokenDetail";
import Verify from "@/pages/Verify";
import Bridge from "@/pages/Bridge";
import Swap from "@/pages/Swap";
import Portfolio from "@/pages/Portfolio";
import Admin from "@/pages/Admin";
import Contact from "@/pages/Contact";
import Navbar from "@/components/layout/Navbar";
import Ticker from "@/components/layout/Ticker";
import Footer from "@/components/layout/Footer";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import { wagmiConfig } from "@/lib/wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

function Router() {
  useReferral();
  const [location] = useLocation();
  const [welcomePending, setWelcomePending] = useState(() => location === "/");
  const mainRef = useRef<HTMLElement | null>(null);
  const welcomeVisible = welcomePending && location === "/";

  const enterLaunchpad = () => {
    // The existing launchpad home is `/`; dismiss in place to preserve query parameters and browser history.
    setWelcomePending(false);
    window.requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true });
    });
  };

  if (welcomeVisible) {
    return <WelcomeOverlay onConnect={enterLaunchpad} />;
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
        <Ticker />
        <Navbar />
        <main
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 focus:outline-none"
        >
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/launch" component={Launch} />
            <Route path="/token/:id" component={TokenDetail} />
            <Route path="/bridge" component={Bridge} />
            <Route path="/swap" component={Swap} />
            <Route path="/verify" component={Verify} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/contact" component={Contact} />
            <Route path="/admin" component={Admin} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
