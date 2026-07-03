import { createConfig, http } from "wagmi";
import { mainnet, bsc } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import type { Chain } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

// ---------------------------------------------------------------------------
// Custom EVM chain definitions
// ---------------------------------------------------------------------------

export const xlayer: Chain = {
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xlayer.tech"] },
  },
  blockExplorers: {
    default: { name: "OKX Explorer", url: "https://www.okx.com/explorer/xlayer" },
  },
};

// Tempo Mainnet — payments-focused EVM chain incubated by Paradigm & Stripe.
// Fees are paid in a stablecoin via Tempo's Fee AMM (TIP-20) rather than a
// volatile native gas token, so we model its "native currency" as USD.
export const tempo: Chain = {
  id: 4217,
  name: "Tempo",
  nativeCurrency: { name: "US Dollar", symbol: "USD", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.tempo.xyz"] },
  },
  blockExplorers: {
    default: { name: "Tempo Explorer", url: "https://explore.tempo.xyz" },
  },
};

// Circle Arc — mainnet chain ID has not been publicly announced yet
// (Circle targets a Summer 2026 mainnet beta). We connect to the live
// public testnet so the app is fully wired for day-one mainnet swap-in —
// once Circle publishes the mainnet chain ID/RPC, update this entry only.
export const arcMainnet: Chain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "Arc Scan", url: "https://testnet.arcscan.app" },
  },
};

// Robinhood Chain — EVM-compatible Arbitrum Orbit L2 settling to Ethereum.
export const robinhoodChain: Chain = {
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Robinhood Explorer", url: "https://robinhoodchain.blockscout.com" },
  },
};

const connectorList = [
  injected(),
  coinbaseWallet({ appName: "Barbie Fun" }),
  ...(projectId ? [walletConnect({ projectId })] : []),
];

export const wagmiConfig = createConfig({
  chains: [bsc, mainnet, xlayer, tempo, arcMainnet, robinhoodChain],
  connectors: connectorList,
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
    [mainnet.id]: http("https://cloudflare-eth.com"),
    [xlayer.id]: http("https://rpc.xlayer.tech"),
    [tempo.id]: http("https://rpc.tempo.xyz"),
    [arcMainnet.id]: http("https://rpc.testnet.arc.network"),
    [robinhoodChain.id]: http("https://rpc.mainnet.chain.robinhood.com"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

// ---------------------------------------------------------------------------
// Chain metadata used across the UI (wallet-connectable EVM chains only)
// ---------------------------------------------------------------------------

export type ChainMeta = {
  id: number;
  name: string;
  symbol: string;
  /** id used by the ChainIcon component */
  icon: string;
  dex: string;
  /** true when the gas token is a USD-pegged stablecoin (fee = $5 flat) */
  isStableGas?: boolean;
  /** true when only a testnet is publicly available today */
  isTestnet?: boolean;
};

export const SUPPORTED_CHAINS: ChainMeta[] = [
  { id: bsc.id, name: "BNB Smart Chain", symbol: "BNB", icon: "bnb", dex: "https://pancakeswap.finance/swap" },
  { id: mainnet.id, name: "Ethereum", symbol: "ETH", icon: "ethereum", dex: "https://app.uniswap.org/swap" },
  { id: xlayer.id, name: "X Layer", symbol: "OKB", icon: "xlayer", dex: "https://www.okx.com/dex" },
  { id: tempo.id, name: "Tempo", symbol: "USD", icon: "tempo", dex: "https://explore.tempo.xyz", isStableGas: true },
  { id: arcMainnet.id, name: "Arc Mainnet", symbol: "USDC", icon: "arc", dex: "https://testnet.arcscan.app", isStableGas: true, isTestnet: true },
  { id: robinhoodChain.id, name: "Robinhood Chain", symbol: "ETH", icon: "robinhood", dex: "https://robinhoodchain.blockscout.com" },
];

/**
 * X1 Blockchain (x1.xyz) runs on the Solana Virtual Machine, not the EVM.
 * It has no EIP-155 numeric chain ID, no Ethereum-style JSON-RPC, and is
 * only reachable through SVM wallets (Phantom, Solflare, Backpack) — never
 * MetaMask / WalletConnect / wagmi. It is intentionally excluded from
 * `wagmiConfig` and `SUPPORTED_CHAINS`. See SvmChainNotice for the UI
 * treatment and README/summary for the full explanation.
 */
export const X1_CHAIN_INFO = {
  name: "X1 Blockchain",
  symbol: "XN",
  icon: "x1",
  vm: "SVM",
  rpc: "https://rpc.x1.xyz",
  explorer: "https://explorer.x1.xyz",
  bridge: "https://app.bridge.x1.xyz/",
  requiredWallets: ["Phantom", "Solflare", "Backpack"],
  reason:
    "X1 is a Solana Virtual Machine (SVM) chain, not EVM-compatible. MetaMask, WalletConnect and wagmi only speak Ethereum JSON-RPC, so X1 cannot appear as a connectable network in this wallet modal. Supporting it for real would require a parallel Solana wallet-adapter integration (@solana/wallet-adapter + @solana/web3.js) and an SPL-token deployment flow, entirely separate from the EVM stack used here.",
};
