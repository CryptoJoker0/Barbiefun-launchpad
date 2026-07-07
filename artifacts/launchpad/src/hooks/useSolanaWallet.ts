/**
 * Lightweight hook for connecting to Solana-compatible wallets on X1 Blockchain.
 * Detects Phantom and Backpack via their browser window injections without
 * requiring the heavy @solana/wallet-adapter stack.
 *
 * Subscribes to provider disconnect/accountChanged events so local state
 * stays in sync if the user switches accounts or disconnects from the wallet UI.
 */
import { useState, useCallback, useEffect, useRef } from "react";

export type SolanaWalletId = "phantom" | "backpack";

export type SolanaWalletState = {
  connected: boolean;
  publicKey: string | null;
  walletId: SolanaWalletId | null;
};

/** Check if Phantom is available in this browser */
export function isPhantomAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const phantom = (window as any).phantom?.solana;
  const solana = (window as any).solana;
  return !!(phantom?.isPhantom || solana?.isPhantom);
}

/** Check if Backpack is available in this browser */
export function isBackpackAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).backpack?.solana;
}

function getPhantomProvider(): any | null {
  const w = window as any;
  return w.phantom?.solana ?? (w.solana?.isPhantom ? w.solana : null);
}

function getBackpackProvider(): any | null {
  const w = window as any;
  return w.backpack?.solana ?? null;
}

function getProvider(walletId: SolanaWalletId): any | null {
  return walletId === "phantom" ? getPhantomProvider() : getBackpackProvider();
}

const INITIAL_STATE: SolanaWalletState = {
  connected: false,
  publicKey: null,
  walletId: null,
};

export function useSolanaWallet() {
  const [state, setState] = useState<SolanaWalletState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  // track which walletId has event listeners attached
  const listenedWallet = useRef<SolanaWalletId | null>(null);

  // ── Provider event sync ──────────────────────────────────────────────────
  useEffect(() => {
    const wid = state.walletId;
    if (!wid || listenedWallet.current === wid) return;

    const provider = getProvider(wid);
    if (!provider) return;

    const onDisconnect = () =>
      setState(INITIAL_STATE);

    const onAccountChange = (publicKey: any) => {
      if (!publicKey) {
        setState(INITIAL_STATE);
      } else {
        setState((prev) => ({ ...prev, publicKey: publicKey.toString() }));
      }
    };

    // Both Phantom and Backpack follow the same event API
    provider.on?.("disconnect", onDisconnect);
    provider.on?.("accountChanged", onAccountChange);
    listenedWallet.current = wid;

    return () => {
      provider.off?.("disconnect", onDisconnect);
      provider.off?.("accountChanged", onAccountChange);
      listenedWallet.current = null;
    };
  }, [state.walletId]);

  // ── Re-check availability after page load (wallets inject asynchronously) ─
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setTick((t) => t + 1), 800);
    return () => clearTimeout(id);
  }, []);

  // ── Connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(async (walletId: SolanaWalletId) => {
    setError(null);
    setIsPending(true);
    try {
      const provider = getProvider(walletId);
      if (!provider) {
        const installUrl =
          walletId === "phantom" ? "https://phantom.app/" : "https://backpack.app/";
        window.open(installUrl, "_blank");
        throw new Error(
          `${walletId === "phantom" ? "Phantom" : "Backpack"} not found — install it and reload`
        );
      }
      const resp = await provider.connect();
      const pk: string = resp.publicKey?.toString() ?? resp.toString();
      setState({ connected: true, publicKey: pk, walletId });
    } catch (err: any) {
      setError(err?.message ?? "Connection failed");
      setState(INITIAL_STATE);
    } finally {
      setIsPending(false);
    }
  }, []);

  // ── Disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    if (state.walletId) {
      try {
        await getProvider(state.walletId)?.disconnect();
      } catch {
        // ignore — state is reset regardless
      }
    }
    setState(INITIAL_STATE);
    setError(null);
  }, [state.walletId]);

  return {
    ...state,
    error,
    isPending,
    connect,
    disconnect,
    isPhantomAvailable: isPhantomAvailable(),
    isBackpackAvailable: isBackpackAvailable(),
  };
}
