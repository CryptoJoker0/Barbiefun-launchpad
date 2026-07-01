import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Launch from "@/pages/Launch";
import TokenDetail from "@/pages/TokenDetail";
import Verify from "@/pages/Verify";
import Navbar from "@/components/layout/Navbar";
import Ticker from "@/components/layout/Ticker";
import { wagmiConfig } from "@/lib/wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

function Router() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <Ticker />
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/launch" component={Launch} />
          <Route path="/token/:id" component={TokenDetail} />
          <Route path="/verify" component={Verify} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
