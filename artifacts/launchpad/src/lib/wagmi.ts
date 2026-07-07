import { createConfig, http } from "wagmi";
import { base, bsc } from "wagmi/chains";
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

// Circle Arc — mainnet chain ID has not been publicly announced yet.
export const arcMainnet: Chain = {
  id: 5042002,
  name: "Arc Mainnet",
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
  chains: [bsc, base, xlayer, tempo, arcMainnet, robinhoodChain],
  connectors: connectorList,
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
    [base.id]: http("https://mainnet.base.org"),
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
// Chain metadata used across the UI
// ---------------------------------------------------------------------------

export type ChainMeta = {
  id: number;
  name: string;
  symbol: string;
  /** Full native token name, e.g. "BNB", "Ether" */
  tokenName: string;
  /** id used by the ChainIcon component */
  icon: string;
  dex: string;
  /** true when the gas token is a USD-pegged stablecoin (fee = $5 flat) */
  isStableGas?: boolean;
  /** true when only a testnet is publicly available today */
  isTestnet?: boolean;
  /** true when this chain runs on the Solana VM (not EVM) */
  isSvm?: boolean;
  /** CoinGecko price feed ID for the native token */
  coingeckoId?: string;
};

/**
 * EVM-only chains that can be passed to wagmi's switchChain.
 * Never add SVM/non-EVM entries here.
 */
export const SUPPORTED_CHAINS: ChainMeta[] = [
  { id: bsc.id,          name: "BNB Smart Chain", symbol: "BNB",  tokenName: "BNB",      icon: "bnb",      dex: "https://pancakeswap.finance/swap",                coingeckoId: "binancecoin" },
  { id: base.id,         name: "Base",             symbol: "ETH",  tokenName: "Ether",    icon: "base",     dex: "https://app.uniswap.org/swap?chain=base",          coingeckoId: "ethereum"    },
  { id: xlayer.id,       name: "X Layer",          symbol: "OKB",  tokenName: "OKB",      icon: "xlayer",   dex: "https://www.okx.com/dex",                          coingeckoId: "okb"         },
  { id: tempo.id,        name: "Tempo",            symbol: "USD",  tokenName: "US Dollar",icon: "tempo",    dex: "https://explore.tempo.xyz",  isStableGas: true                               },
  { id: arcMainnet.id,   name: "Arc Mainnet",      symbol: "USDC", tokenName: "USD Coin", icon: "arc",      dex: "https://testnet.arcscan.app", isStableGas: true                               },
  { id: robinhoodChain.id, name: "Robinhood Chain",symbol: "ETH",  tokenName: "Ether",    icon: "robinhood",dex: "https://robinhoodchain.blockscout.com",             coingeckoId: "ethereum"    },
];

/**
 * All chains for display-only UI (home page badge strip, token prices, etc.).
 * Includes EVM chains + SVM chains (X1, Solana) as read-only display entries.
 * Do NOT use this list for wagmi switchChain calls.
 */
export const DISPLAY_CHAINS: ChainMeta[] = [
  ...SUPPORTED_CHAINS,
  { id: -1, name: "X1 Blockchain", symbol: "XN",  tokenName: "XN Token", icon: "x1",     dex: "https://app.bridge.x1.xyz/", isSvm: true },
  { id: -2, name: "Solana",        symbol: "SOL", tokenName: "Solana",   icon: "solana", dex: "https://jup.ag",              isSvm: true, coingeckoId: "solana" },
];

// ---------------------------------------------------------------------------
// SVM chain metadata
// ---------------------------------------------------------------------------

export const X1_CHAIN_INFO = {
  name: "X1 Blockchain",
  symbol: "XN",
  tokenName: "XN Token",
  icon: "x1",
  vm: "SVM",
  rpc: "https://rpc.x1.xyz",
  explorer: "https://explorer.x1.xyz",
  bridge: "https://app.bridge.x1.xyz/",
  webWallet: "https://wallet.x1.xyz/",
  requiredWallets: ["Phantom", "Backpack", "X1 Web Wallet"],
};

export const SOLANA_CHAIN_INFO = {
  name: "Solana",
  symbol: "SOL",
  tokenName: "Solana",
  icon: "solana",
  vm: "SVM",
  rpc: "https://api.mainnet-beta.solana.com",
  explorer: "https://solscan.io",
  dex: "https://jup.ag",
  bridge: "https://portalbridge.com",
  requiredWallets: ["Phantom", "Backpack"],
};
