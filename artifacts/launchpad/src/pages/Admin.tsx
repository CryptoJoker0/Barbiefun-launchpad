import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Rocket, DollarSign, CheckCircle2, Link2, TrendingUp, BadgeCheck, Activity, Settings, ShieldCheck, Zap, AlertCircle, Plus, X, Radio, Upload, Video, LogOut, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS, DISPLAY_CHAINS } from "@/lib/wagmi";
import { useAccount, useSwitchChain } from "wagmi";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import WalletModal from "@/components/WalletModal";
import { type Launch } from "@/lib/launches";
import { useLaunches, useAddLaunch, useSetVerified } from "@/hooks/useLaunches";
import { LAUNCH_FEE_USD } from "@/lib/pricing";
import { useLiveStream, useUpdateLiveStream } from "@/hooks/useLiveStream";
import { useUpload } from "@/hooks/useUpload";
import { getAdminSession, loginAdmin, logoutAdmin } from "@/lib/adminAuth";

const PIE_COLORS = ["#ec4899", "#db2777", "#f472b6", "#8b5cf6", "#3b82f6", "#14b8a6"];

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authPending, setAuthPending] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState<"overview" | "launches" | "chains" | "add" | "referrals" | "live" | "settings" | "wallet">("overview");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWalletChainId, setSelectedWalletChainId] = useState(-1);
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const solana = useSolanaWallet();
  const { data: launches = [], refetch } = useLaunches();
  const addLaunchMutation = useAddLaunch();
  const setVerifiedMutation = useSetVerified();
  const { data: liveStream } = useLiveStream();
  const updateLiveMutation = useUpdateLiveStream();
  const [liveForm, setLiveForm] = useState({
    isLive: false,
    title: "Barbie Fun Live",
    embedUrl: "",
    goLiveUrl: "https://t.me/barbiefunv2/65",
    videoObjectPath: "",
    videoTitle: "",
  });
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const { uploadFile, isUploading: isUploadingVideo, progress: uploadProgress } = useUpload();

  useEffect(() => {
    getAdminSession()
      .then((session) => setAuthenticated(session.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!liveStream) return;
    setLiveForm({
      isLive: liveStream.isLive,
      title: liveStream.title,
      embedUrl: liveStream.embedUrl ?? "",
      goLiveUrl: liveStream.goLiveUrl ?? "",
      videoObjectPath: liveStream.videoObjectPath ?? "",
      videoTitle: liveStream.videoTitle ?? "",
    });
  }, [liveStream]);

  const BLANK_ADD_FORM = {
    name: "", ticker: "", description: "",
    website: "", twitter: "", telegram: "",
    totalSupply: "", chainId: "", deployer: "", feeTxHash: "",
    verified: false,
  };
  const [addForm, setAddForm] = useState(BLANK_ADD_FORM);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const chainId = Number(addForm.chainId);
    const allChains = [...SUPPORTED_CHAINS, ...DISPLAY_CHAINS];
    const chainMeta = allChains.find((c) => c.id === chainId);
    if (!chainMeta) { setAddError("Select a valid chain."); return; }
    if (!addForm.name.trim() || !addForm.ticker.trim()) { setAddError("Name and ticker are required."); return; }
    if (!addForm.totalSupply.trim()) { setAddError("Total supply is required."); return; }
    if (!addForm.deployer.trim()) { setAddError("Deployer / contract address is required."); return; }
    if (!addForm.feeTxHash.trim()) { setAddError("Fee tx hash is required."); return; }

    const ticker = addForm.ticker.trim().toUpperCase().replace(/^\$/, "");
    try {
      await addLaunchMutation.mutateAsync({
        id: `admin-${Date.now()}`,
        name: addForm.name.trim(),
        ticker,
        description: addForm.description.trim(),
        website: addForm.website.trim() || null,
        twitter: addForm.twitter.trim() || null,
        telegram: addForm.telegram.trim() || null,
        totalSupply: addForm.totalSupply.trim(),
        chainId,
        chainName: chainMeta.name,
        deployer: addForm.deployer.trim(),
        feeTxHash: addForm.feeTxHash.trim(),
        verified: addForm.verified,
      });
      setAddSuccess(`${ticker} added — it now appears on the home page.`);
      setAddForm(BLANK_ADD_FORM);
      setTimeout(() => setAddSuccess(null), 6000);
    } catch (err: any) {
      setAddError(err?.message ?? "Failed to add token. Please try again.");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthPending(true);
    setPwError(false);
    try {
      const session = await loginAdmin(pw);
      setAuthenticated(session.authenticated);
      setPw("");
    } catch {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    } finally {
      setAuthPending(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin().catch(() => undefined);
    setAuthenticated(false);
    setTab("overview");
  };

  const refresh = () => refetch();

  const selectedWalletChain = DISPLAY_CHAINS.find((c) => c.id === selectedWalletChainId) ?? DISPLAY_CHAINS[0];
  const walletConfirmed = selectedWalletChain.isSvm
    ? solana.connected
    : isConnected && chain?.id === selectedWalletChain.id;

  const confirmWalletForChain = () => {
    if (selectedWalletChain.isSvm) {
      if (!solana.connected) setWalletModalOpen(true);
      return;
    }

    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }

    if (chain?.id !== selectedWalletChain.id) {
      switchChain({ chainId: selectedWalletChain.id });
    }
  };

  const handleSaveLiveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setLiveError(null);
    setLiveMessage(null);
    try {
      await updateLiveMutation.mutateAsync({
        ...liveForm,
        embedUrl: liveForm.embedUrl.trim() || null,
        goLiveUrl: liveForm.goLiveUrl.trim() || null,
        videoObjectPath: liveForm.videoObjectPath.trim() || null,
        videoTitle: liveForm.videoTitle.trim() || null,
      });
      setLiveMessage("Live stream settings saved. The home page is updated.");
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : "Could not save live stream settings.");
    }
  };

  const handleVideoUpload = async (file: File) => {
    setLiveError(null);
    const result = await uploadFile(file);
    if (result) {
      setLiveForm((current) => ({
        ...current,
        videoObjectPath: result.objectPath,
        videoTitle: current.videoTitle || file.name.replace(/\.[^/.]+$/, ""),
      }));
      setLiveMessage("Video uploaded. Save the live stream settings to publish it.");
    }
  };

  const toggleVerify = async (id: string, current: boolean) => {
    try {
      await setVerifiedMutation.mutateAsync({ id, verified: !current });
    } catch { /* React Query invalidates on success; silent on error */ }
  };

  if (!authChecked) {
    return <div className="max-w-sm mx-auto py-24 text-center text-sm font-semibold text-pink-500">Checking admin access…</div>;
  }

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto py-24 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-pink-900">Admin Access</h1>
          <p className="text-sm text-pink-400 mt-1">Enter the admin password to continue</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password"
            className={`w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
              pwError ? "border-rose-300 focus:ring-rose-300" : "border-pink-200/60 focus:ring-pink-300"
            }`}
          />
          {pwError && (
            <p className="text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Incorrect password
            </p>
          )}
          <button
            type="submit"
            disabled={authPending}
            className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white font-bold py-3 rounded-xl hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 disabled:opacity-60 transition-all"
          >
            {authPending ? "Checking…" : "Enter Dashboard"}
          </button>
        </form>
        <p className="text-center text-xs text-pink-400 mt-4">Your password is checked securely by the server.</p>
      </div>
    );
  }

  // Compute stats
  const totalLaunches = launches.length;
  const totalRevenue = totalLaunches * LAUNCH_FEE_USD;
  const verifiedCount = launches.filter((l) => l.verified).length;
  const evmChains = SUPPORTED_CHAINS.length;
  const svmChains = DISPLAY_CHAINS.filter((c) => c.isSvm).length;

  // Launches by chain
  const chainCounts = SUPPORTED_CHAINS.map((c) => ({
    name: c.name.split(" ")[0],
    icon: c.icon,
    count: launches.filter((l) => l.chainId === c.id).length,
    symbol: c.symbol,
  }));

  // Recent 10 launches
  const recentLaunches = [...launches]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Referral breakdown
  const referralCounts = launches
    .filter((l) => l.referredBy)
    .reduce<Record<string, number>>((acc, l) => {
      const key = l.referredBy!;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  const referralRows = Object.entries(referralCounts).sort((a, b) => b[1] - a[1]);

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "launches", label: "Launches", icon: Rocket },
    { id: "chains", label: "Chains", icon: Link2 },
    { id: "add", label: "Add Token", icon: Plus },
    { id: "referrals", label: "Referrals", icon: TrendingUp },
    { id: "live", label: "Live Stream & Upload", icon: Radio },
    { id: "wallet", label: "Wallet Confirm", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto py-8 pb-20 animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-pink-900">Admin Dashboard</h1>
            <p className="text-xs text-pink-400">Barbie Fun · Platform Control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <button
            onClick={refresh}
            className="text-xs text-pink-500 hover:text-pink-600 font-semibold border border-pink-200/60 rounded-full px-3 py-1 hover:bg-pink-50 transition-all"
          >
            Refresh
          </button>
          <button
            onClick={() => void handleLogout()}
            className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 font-semibold border border-pink-200/60 rounded-full px-3 py-1 hover:bg-pink-50 transition-all"
          >
            <LogOut className="w-3 h-3" /> Log out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-pink-50 border border-pink-100 rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === id ? "bg-white text-pink-600 shadow-sm" : "text-pink-400 hover:text-pink-600"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* WALLET CONFIRMATION TAB */}
      {tab === "wallet" && (
        <div className="space-y-4">
          <Card className="border-purple-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-purple-700 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Confirm Wallet by Chain
              </CardTitle>
              <p className="text-xs text-purple-400">
                Select a network, then connect or switch the wallet used to confirm verification-fee payments.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Select chain</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {DISPLAY_CHAINS.map((chainOption) => (
                    <button
                      key={chainOption.id}
                      type="button"
                      onClick={() => setSelectedWalletChainId(chainOption.id)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left transition-all ${
                        selectedWalletChainId === chainOption.id
                          ? chainOption.isSvm
                            ? "border-purple-500 bg-purple-50 shadow-sm"
                            : "border-pink-500 bg-pink-50 shadow-sm"
                          : "border-pink-100 hover:border-purple-200"
                      }`}
                    >
                      <ChainIcon chain={chainOption.icon} size={24} />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-pink-900 truncate">{chainOption.name}</span>
                        <span className={`block text-[10px] font-semibold ${chainOption.isSvm ? "text-purple-500" : "text-pink-400"}`}>
                          {chainOption.isSvm ? `SVM · ${chainOption.symbol}` : `EVM · ${chainOption.symbol}`}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${selectedWalletChain.isSvm ? "border-purple-200 bg-purple-50/60" : "border-pink-200 bg-pink-50/60"}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChainIcon chain={selectedWalletChain.icon} size={34} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-pink-400">Selected network</p>
                      <p className="font-extrabold text-pink-900">{selectedWalletChain.name}</p>
                      <p className={`text-xs font-semibold ${selectedWalletChain.isSvm ? "text-purple-500" : "text-pink-500"}`}>
                        {walletConfirmed
                          ? `${selectedWalletChain.isSvm ? (solana.walletId === "phantom" ? "Phantom" : "Backpack") : "EVM wallet"} confirmed`
                          : selectedWalletChain.isSvm
                            ? "SVM wallet not connected"
                            : isConnected
                              ? `Connected on ${chain?.name ?? "another network"}`
                              : "EVM wallet not connected"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={confirmWalletForChain}
                    disabled={walletConfirmed || isSwitchingChain || solana.isPending}
                    className={`rounded-full px-5 py-2.5 text-sm font-extrabold text-white transition-all disabled:opacity-60 ${
                      selectedWalletChain.isSvm
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 hover:from-pink-600 hover:via-pink-700 hover:to-pink-800"
                    }`}
                  >
                    {walletConfirmed
                      ? "Wallet confirmed"
                      : isSwitchingChain
                        ? "Switching…"
                        : isConnected && !selectedWalletChain.isSvm
                          ? `Switch to ${selectedWalletChain.name}`
                          : "Connect wallet"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-pink-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-pink-400">EVM wallet confirmation</p>
                  <p className="text-2xl font-extrabold text-pink-900 mt-1">$5.00</p>
                  <p className="text-xs text-pink-500 mt-1">Admin-only confirmation reference; wallet connection handles the selected network.</p>
                </div>
                <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-400">SVM wallet confirmation</p>
                  <p className="text-2xl font-extrabold text-purple-900 mt-1">$5.00</p>
                  <p className="text-xs text-purple-500 mt-1">Admin-only confirmation reference; wallet connection handles the selected network.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Launches", value: totalLaunches, icon: Rocket, color: "text-pink-500", bg: "bg-pink-50" },
              { label: "Total Revenue", value: `$${totalRevenue}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Verified Tokens", value: verifiedCount, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "EVM + SVM Chains", value: `${evmChains} + ${svmChains}`, icon: Link2, color: "text-purple-500", bg: "bg-purple-50" },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${kpi.bg} mb-3`}>
                    <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                  </div>
                  <p className="text-2xl font-extrabold text-pink-900">{kpi.value}</p>
                  <p className="text-xs text-pink-400 font-medium mt-0.5">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart — launches by chain */}
            <Card className="border-pink-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Launches by Chain
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalLaunches === 0 ? (
                  <div className="h-40 flex items-center justify-center text-pink-400 text-sm">
                    No launches yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chainCounts} barSize={28}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid #fce7f3", fontSize: 12 }}
                        formatter={(v: any) => [`${v} launches`, "Count"]}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chainCounts.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie chart — distribution */}
            <Card className="border-pink-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Chain Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                {totalLaunches === 0 ? (
                  <div className="h-40 w-full flex items-center justify-center text-pink-400 text-sm">
                    No data yet
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="55%" height={180}>
                      <PieChart>
                        <Pie
                          data={chainCounts.filter((c) => c.count > 0)}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {chainCounts.filter((c) => c.count > 0).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`${v} launches`]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 flex-1">
                      {chainCounts.filter((c) => c.count > 0).map((c, i) => (
                        <div key={c.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-pink-700 font-medium">{c.name}</span>
                          <span className="ml-auto font-bold text-pink-900">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <Card className="border-pink-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLaunches.length === 0 ? (
                <p className="text-sm text-pink-400 text-center py-6">No launches recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentLaunches.map((l) => {
                    const chainMeta = SUPPORTED_CHAINS.find((c) => c.id === l.chainId);
                    return (
                      <div key={l.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-pink-50 hover:border-pink-100 transition-colors">
                        <div className="flex items-center gap-3">
                          {chainMeta && <ChainIcon chain={chainMeta.icon} size={20} />}
                          <div>
                            <span className="font-bold text-sm text-pink-900">${l.ticker}</span>
                            <span className="text-xs text-pink-400 ml-2">{l.name}</span>
                          </div>
                          {l.verified && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-500 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-pink-400 font-mono">
                            {l.deployer.slice(0, 6)}…{l.deployer.slice(-4)}
                          </span>
                          <span className="text-[10px] text-pink-400">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => toggleVerify(l.id, !!l.verified)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                              l.verified
                                ? "bg-emerald-50 text-emerald-500 border-emerald-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                : "bg-pink-50/50 text-pink-600/80 border-pink-200/60 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200"
                            }`}
                          >
                            {l.verified ? "✓ Verified" : "Verify"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* LAUNCHES TAB */}
      {tab === "launches" && (
        <Card className="border-pink-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-pink-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                All Launches ({launches.length})
              </div>
              <span className="text-xs text-pink-400 font-normal">Revenue: ${launches.length * LAUNCH_FEE_USD}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {launches.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="w-10 h-10 text-pink-200 mx-auto mb-3" />
                <p className="text-pink-400 text-sm">No launches yet. They'll appear here once users launch tokens.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pink-100">
                      <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Token</th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Chain</th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Deployer</th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Date</th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {launches.map((l) => {
                      const chainMeta = SUPPORTED_CHAINS.find((c) => c.id === l.chainId);
                      return (
                        <tr key={l.id} className="hover:bg-pink-50/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-pink-900">${l.ticker}</div>
                            <div className="text-[10px] text-pink-400">{l.name}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              {chainMeta && <ChainIcon chain={chainMeta.icon} size={14} />}
                              <span className="text-xs text-pink-700">{chainMeta?.name ?? l.chainName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-pink-400">
                            {l.deployer.slice(0, 8)}…{l.deployer.slice(-6)}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-pink-400">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => toggleVerify(l.id, !!l.verified)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                                l.verified
                                  ? "bg-emerald-100 text-emerald-600 border-emerald-300 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                  : "bg-pink-100/50 text-pink-600/80 border-pink-200/60 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200"
                              }`}
                            >
                              {l.verified ? "✓ Verified" : "Unverified"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CHAINS TAB */}
      {tab === "chains" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DISPLAY_CHAINS.map((chain) => (
              <Card key={chain.id} className={`border shadow-sm ${chain.isSvm ? "border-purple-200" : "border-pink-100"}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ChainIcon chain={chain.icon} size={32} />
                      <div>
                        <p className="font-bold text-pink-900">{chain.name}</p>
                        <p className="text-xs text-pink-400">{chain.symbol} · {chain.tokenName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {chain.isSvm ? (
                        <span className="text-[9px] bg-purple-100 text-purple-600 border border-purple-200 rounded-full px-2 py-0.5 font-bold">SVM</span>
                      ) : (
                        <span className="text-[9px] bg-emerald-100 text-emerald-500 border border-emerald-200 rounded-full px-2 py-0.5 font-bold">EVM ✓</span>
                      )}
                      {chain.isStableGas && (
                        <span className="text-[9px] bg-blue-100 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5 font-bold">Stable Gas</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-pink-400">
                      Launches: <strong className="text-pink-800">{chain.isSvm ? "—" : launches.filter((l) => l.chainId === chain.id).length}</strong>
                    </span>
                    <a href={chain.dex} target="_blank" rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-600 font-semibold">
                      DEX →
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ADD TOKEN TAB */}
      {tab === "add" && (
        <div className="max-w-2xl space-y-4">
          {addSuccess && (
            <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-sm font-semibold text-emerald-700">{addSuccess}</p>
              </div>
              <button onClick={() => setAddSuccess(null)}><X className="w-4 h-4 text-emerald-400 hover:text-emerald-600" /></button>
            </div>
          )}
          {addError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-sm font-semibold text-rose-700">{addError}</p>
            </div>
          )}

          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Token to Recently Launched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddToken} className="space-y-5">

                {/* Chain */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Chain *</label>
                  <select
                    value={addForm.chainId}
                    onChange={(e) => setAddForm((f) => ({ ...f, chainId: e.target.value }))}
                    required
                    className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                  >
                    <option value="">Select chain…</option>
                    <optgroup label="EVM Chains">
                      {SUPPORTED_CHAINS.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                      ))}
                    </optgroup>
                    <optgroup label="SVM Chains">
                      {DISPLAY_CHAINS.filter((c) => c.isSvm).map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Name + Ticker */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Token Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Barbie Coin"
                      value={addForm.name}
                      onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Ticker *</label>
                    <input
                      type="text"
                      placeholder="e.g. BARB"
                      value={addForm.ticker}
                      onChange={(e) => setAddForm((f) => ({ ...f, ticker: e.target.value }))}
                      required
                      className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Description *</label>
                  <textarea
                    placeholder="Brief description of the token / project…"
                    value={addForm.description}
                    onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                    required
                    rows={3}
                    className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                  />
                </div>

                {/* Total Supply */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Total Supply *</label>
                  <input
                    type="text"
                    placeholder="e.g. 1000000000"
                    value={addForm.totalSupply}
                    onChange={(e) => setAddForm((f) => ({ ...f, totalSupply: e.target.value }))}
                    required
                    className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                {/* Deployer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Deployer / Contract Address *</label>
                  <input
                    type="text"
                    placeholder="0x… or base58 pubkey"
                    value={addForm.deployer}
                    onChange={(e) => setAddForm((f) => ({ ...f, deployer: e.target.value }))}
                    required
                    className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                {/* Fee Tx Hash */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Fee Tx Hash *</label>
                  <input
                    type="text"
                    placeholder="Transaction hash of the launch fee payment"
                    value={addForm.feeTxHash}
                    onChange={(e) => setAddForm((f) => ({ ...f, feeTxHash: e.target.value }))}
                    required
                    className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                {/* Socials */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Website</label>
                    <input
                      type="url"
                      placeholder="https://"
                      value={addForm.website}
                      onChange={(e) => setAddForm((f) => ({ ...f, website: e.target.value }))}
                      className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Twitter / X</label>
                    <input
                      type="url"
                      placeholder="https://x.com/…"
                      value={addForm.twitter}
                      onChange={(e) => setAddForm((f) => ({ ...f, twitter: e.target.value }))}
                      className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Telegram</label>
                    <input
                      type="url"
                      placeholder="https://t.me/…"
                      value={addForm.telegram}
                      onChange={(e) => setAddForm((f) => ({ ...f, telegram: e.target.value }))}
                      className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                </div>

                {/* Verified toggle */}
                <div className="flex items-center gap-3 py-3 px-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <input
                    type="checkbox"
                    id="add-verified"
                    checked={addForm.verified}
                    onChange={(e) => setAddForm((f) => ({ ...f, verified: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="add-verified" className="text-sm font-semibold text-emerald-700 cursor-pointer select-none">
                    Mark as Verified immediately
                    <span className="block text-xs font-normal text-emerald-500 mt-0.5">Shows the blue checkmark on the token card</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 text-white font-extrabold text-sm h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Token to Launchpad
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* REFERRALS TAB */}
      {tab === "referrals" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Referred Launches", value: launches.filter((l) => l.referredBy).length, color: "text-pink-900" },
              { label: "Organic Launches", value: launches.filter((l) => !l.referredBy).length, color: "text-pink-900" },
              { label: "Unique Referrers", value: referralRows.length, color: "text-purple-700" },
            ].map((s) => (
              <Card key={s.label} className="border-pink-100 shadow-sm">
                <CardContent className="p-5 text-center">
                  <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-pink-400 mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Referrer Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referralRows.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <p className="text-sm text-pink-400">No referral activity yet.</p>
                  <p className="text-xs text-pink-300">Share a referral link: <code className="bg-pink-50 border border-pink-100 rounded px-1.5 py-0.5 text-pink-600">https://yoursite.com/?ref=yourwallet</code></p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-pink-100">
                        <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Referrer</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Launches</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-pink-400 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {referralRows.map(([ref, count]) => (
                        <tr key={ref} className="hover:bg-pink-50/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-xs text-pink-700 max-w-[280px] truncate">{ref}</td>
                          <td className="py-2.5 px-3 font-bold text-pink-900">{count}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-600">${count * LAUNCH_FEE_USD}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* LIVE STREAM TAB */}
      {tab === "live" && (
        <div className="max-w-3xl space-y-4">
          {liveMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> {liveMessage}
            </div>
          )}
          {liveError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4" /> {liveError}
            </div>
          )}
          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                <Radio className="w-4 h-4" /> Live Stream Controls
              </CardTitle>
              <p className="text-xs text-pink-400">Connect an embed or manually upload a video for visitors to play in the Barbie Fun Live section.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveLiveStream} className="space-y-5">
                <label className="flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={liveForm.isLive}
                    onChange={(e) => setLiveForm((current) => ({ ...current, isLive: e.target.checked }))}
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span>
                    <span className="block text-sm font-bold text-pink-900">Show as live now</span>
                    <span className="block text-xs text-pink-500">Displays the red Live badge on the public page.</span>
                  </span>
                </label>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Stream title</label>
                  <input type="text" value={liveForm.title} onChange={(e) => setLiveForm((current) => ({ ...current, title: e.target.value }))} maxLength={120} className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Embed URL</label>
                    <input type="url" placeholder="https://www.youtube.com/embed/…" value={liveForm.embedUrl} onChange={(e) => setLiveForm((current) => ({ ...current, embedUrl: e.target.value }))} className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                    <p className="text-[11px] text-pink-400">Use the platform’s embed URL, not the normal watch page URL.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-pink-700 uppercase tracking-wide">Community link (optional)</label>
                    <input type="url" placeholder="https://t.me/your-channel" value={liveForm.goLiveUrl} onChange={(e) => setLiveForm((current) => ({ ...current, goLiveUrl: e.target.value }))} className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                    <p className="text-[11px] text-pink-400">Playback stays on this page; this link is only saved for community use.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-pink-500" />
                    <div>
                      <p className="text-sm font-bold text-pink-900">Upload a video</p>
                      <p className="text-xs text-pink-400">Manual upload: MP4, WebM, OGG, or MOV up to 100 MB.</p>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-full bg-white border border-pink-200 px-4 py-2 text-sm font-bold text-pink-600 hover:border-pink-400 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    {isUploadingVideo ? `Uploading ${uploadProgress}%` : "Choose video"}
                    <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="sr-only" disabled={isUploadingVideo} onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleVideoUpload(file); e.currentTarget.value = ""; }} />
                  </label>
                  {liveForm.videoObjectPath && (
                    <div className="flex items-center justify-between gap-3 bg-white border border-pink-100 rounded-xl px-3 py-2 text-xs">
                      <span className="font-semibold text-pink-700 truncate">{liveForm.videoTitle || "Uploaded video ready"}</span>
                      <button type="button" onClick={() => setLiveForm((current) => ({ ...current, videoObjectPath: "", videoTitle: "" }))} className="text-rose-500 font-bold shrink-0">Remove</button>
                    </div>
                  )}
                  <input type="text" placeholder="Video title (optional)" value={liveForm.videoTitle} onChange={(e) => setLiveForm((current) => ({ ...current, videoTitle: e.target.value }))} maxLength={160} className="w-full border border-pink-200/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white" />
                </div>
                <button type="submit" disabled={updateLiveMutation.isPending} className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 disabled:opacity-60 text-white font-extrabold text-sm h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                  <Radio className="w-4 h-4" />
                  {updateLiveMutation.isPending ? "Saving…" : "Save Live Stream Settings"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === "settings" && (
        <div className="space-y-4">
          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Platform Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {[
                { key: "VITE_LAUNCH_FEE_TREASURY_ADDRESS", label: "EVM Treasury Address", description: `Wallet that receives ${LAUNCH_FEE_USD} launch fees on EVM chains` },
                { key: "VITE_SOLANA_TREASURY_ADDRESS", label: "Solana / X1 Treasury Address", description: `Wallet that receives ${LAUNCH_FEE_USD} launch fees on SVM chains` },
                { key: "VITE_WALLETCONNECT_PROJECT_ID", label: "WalletConnect Project ID", description: "Enables WalletConnect QR modal" },
                { key: "ADMIN_PASSWORD", label: "Server Admin Password", description: "Stored securely on the API server; never exposed to the browser", serverManaged: true },
              ].map((setting) => {
                const value = import.meta.env[setting.key];
                const configured = !!value;
                return (
                  <div key={setting.key} className="flex items-center justify-between py-3 px-4 rounded-xl border border-pink-50 bg-pink-50/30">
                    <div>
                      <p className="font-bold text-pink-900">{setting.label}</p>
                      <p className="text-xs text-pink-400 mt-0.5">{setting.description}</p>
                      <code className="text-[10px] text-pink-600/80 bg-pink-100/50 px-1.5 py-0.5 rounded mt-1 inline-block">{setting.key}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      {setting.serverManaged ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                          <ShieldCheck className="w-3 h-3" /> Server-managed
                        </span>
                      ) : configured ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                          <CheckCircle2 className="w-3 h-3" /> Set
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                          <AlertCircle className="w-3 h-3" /> Not set
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                Verification Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pink-600/80">
                {launches.filter((l) => !l.verified).length} tokens awaiting review.{" "}
                {verifiedCount} tokens verified.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setTab("launches")}
                  className="text-sm font-bold text-pink-500 hover:text-pink-600 border border-pink-200/60 rounded-full px-4 py-1.5 hover:bg-pink-50 transition-all"
                >
                  View Launches →
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {walletModalOpen && (
        <WalletModal
          initialSection={selectedWalletChain.isSvm ? "x1" : "evm"}
          onClose={() => setWalletModalOpen(false)}
        />
      )}
    </div>
  );
}
