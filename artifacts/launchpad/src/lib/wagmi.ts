import { createConfig, http } from "wagmi";
import { mainnet, bsc } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import type { Chain } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

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

export const arcMainnet: Chain = {
  id: 1116,
  name: "Core Mainnet",
  nativeCurrency: { name: "CORE", symbol: "CORE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.coredao.org"] },
  },
  blockExplorers: {
    default: { name: "Core Scan", url: "https://scan.coredao.org" },
  },
};

const connectorList = [
  injected(),
  coinbaseWallet({ appName: "Barbie Fun" }),
  ...(projectId ? [walletConnect({ projectId })] : []),
];

export const wagmiConfig = createConfig({
  chains: [bsc, mainnet, xlayer, arcMainnet],
  connectors: connectorList,
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
    [mainnet.id]: http("https://cloudflare-eth.com"),
    [xlayer.id]: http("https://rpc.xlayer.tech"),
    [arcMainnet.id]: http("https://rpc.coredao.org"),
  },
});

export const SUPPORTED_CHAINS = [
  { id: bsc.id, name: "BNB Chain", symbol: "BNB", emoji: "🟡", dexId: "bsc", dex: "https://pancakeswap.finance/swap" },
  { id: mainnet.id, name: "Ethereum", symbol: "ETH", emoji: "🔷", dexId: "ethereum", dex: "https://app.uniswap.org/swap" },
  { id: xlayer.id, name: "X Layer", symbol: "OKB", emoji: "🟠", dexId: "xlayer", dex: "https://www.okx.com/dex" },
  { id: arcMainnet.id, name: "Arc Mainnet", symbol: "CORE", emoji: "🟢", dexId: "core", dex: "https://app.sushi.com/swap" },
];

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
