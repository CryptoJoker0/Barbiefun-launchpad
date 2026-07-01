export type Token = {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  launchTime: string;
  isVerified: boolean;
  description: string;
  contractAddress: string;
  totalSupply: number;
  /** Liquidity target to "graduate" to a DEX, in USD */
  graduationTarget: number;
  /** How much of the bonding curve pool has been filled, in USD */
  bondingRaised: number;
};

export const GRADUATION_DEX: Record<string, string> = {
  bsc: "PancakeSwap",
  ethereum: "Uniswap",
  xlayer: "OKX DEX",
  core: "SushiSwap",
};

export function getBondingProgress(token: Token): number {
  return Math.min(100, (token.bondingRaised / token.graduationTarget) * 100);
}

export function isGraduated(token: Token): boolean {
  return token.bondingRaised >= token.graduationTarget;
}

export type Trade = {
  tokenId: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  wallet: string;
  time: string;
};

const tokenNames = [
  { name: "Pepe 2.0", ticker: "PEPE2" },
  { name: "Wojak Coin", ticker: "WOJAK" },
  { name: "Degen Spartan", ticker: "DEGEN" },
  { name: "Moon Mission", ticker: "MOON" },
  { name: "Gigachad", ticker: "CHAD" },
  { name: "Ape Gang", ticker: "APE" },
  { name: "Rugged Again", ticker: "RUGD" },
  { name: "Frog Nation", ticker: "FROG" },
  { name: "Based Bot", ticker: "BASED" },
  { name: "Pump It", ticker: "PUMP" },
  { name: "Shiba Next", ticker: "SHIBX" },
  { name: "Elon Tweet", ticker: "ELON" },
  { name: "Cat WiF Hat", ticker: "CWIF" },
  { name: "Dog In Car", ticker: "DIC" },
  { name: "Diamond Hands", ticker: "DMD" },
  { name: "Paper Hands", ticker: "PPR" },
  { name: "Satoshi Vision", ticker: "SATS" },
  { name: "Vitalik Cat", ticker: "VCAT" },
  { name: "Wen Lambo", ticker: "WEN" },
  { name: "Hodl Tight", ticker: "HODL" },
];

const logoGradients = [
  "linear-gradient(135deg, hsl(160 70% 50%), hsl(200 70% 20%))",
  "linear-gradient(135deg, hsl(280 70% 50%), hsl(320 70% 20%))",
  "linear-gradient(135deg, hsl(30 70% 50%), hsl(60 70% 20%))",
  "linear-gradient(135deg, hsl(190 70% 50%), hsl(230 70% 20%))",
  "linear-gradient(135deg, hsl(350 70% 50%), hsl(20 70% 20%))",
  "linear-gradient(135deg, hsl(100 70% 50%), hsl(140 70% 20%))",
  "linear-gradient(135deg, hsl(220 70% 50%), hsl(260 70% 20%))",
  "linear-gradient(135deg, hsl(45 70% 50%), hsl(80 70% 20%))",
  "linear-gradient(135deg, hsl(170 70% 50%), hsl(210 70% 20%))",
  "linear-gradient(135deg, hsl(310 70% 50%), hsl(350 70% 20%))",
  "linear-gradient(135deg, hsl(60 70% 50%), hsl(100 70% 20%))",
  "linear-gradient(135deg, hsl(240 70% 50%), hsl(280 70% 20%))",
  "linear-gradient(135deg, hsl(15 70% 50%), hsl(45 70% 20%))",
  "linear-gradient(135deg, hsl(130 70% 50%), hsl(170 70% 20%))",
  "linear-gradient(135deg, hsl(200 70% 50%), hsl(240 70% 20%))",
  "linear-gradient(135deg, hsl(340 70% 50%), hsl(380 70% 20%))",
  "linear-gradient(135deg, hsl(75 70% 50%), hsl(115 70% 20%))",
  "linear-gradient(135deg, hsl(260 70% 50%), hsl(300 70% 20%))",
  "linear-gradient(135deg, hsl(5 70% 50%), hsl(35 70% 20%))",
  "linear-gradient(135deg, hsl(150 70% 50%), hsl(190 70% 20%))",
];

const descriptions = [
  "The premier degen token for true degens. Fair launch, no presale, liquidity locked forever.",
  "Community-driven memecoin with diamond hands culture. Aping in is a lifestyle.",
  "Born from the depths of crypto Twitter. No team tokens, no VC allocation, pure community.",
  "The token that rugs rugs. Anti-rug mechanics built in, verified on-chain.",
  "For degens by degens. 100x potential or zero — that is the way.",
  "Built different. Community owns the liquidity forever. Based and redpilled tokenomics.",
  "The next generation of degen finance. Frens only. No paper hands allowed.",
];

const contractAddresses = [
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39",
  "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b",
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
  "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
  "0xa0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xdB25f211AB05b1c97D595516F45794528a807ad8",
  "0x111111111117dC0aa78b770fA6A738034120C302",
  "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4",
  "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  "0x0000000000085d4780B73119b644AE5ecd22b376",
];

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export const mockTokens: Token[] = tokenNames.map((t, i) => {
  const price = seededRand(i * 3) * 0.05 + 0.000001;
  const marketCap = seededRand(i * 7) * 10000000 + 10000;
  const volume24h = marketCap * (seededRand(i * 11) * 0.5 + 0.05);
  const isVerified = i < 6;
  const holders = Math.floor(seededRand(i * 13) * 10000) + 100;

  // graduation target: $30K–$88K (themed around lucky numbers)
  const graduationTarget = Math.round((seededRand(i * 43) * 58000 + 30000) / 1000) * 1000;
  // How much has been raised: 0–110% of target (some tokens are graduated)
  const bondingRaised = Math.round(seededRand(i * 47) * graduationTarget * 1.1);

  return {
    id: t.ticker.toLowerCase(),
    name: t.name,
    ticker: t.ticker,
    logo: logoGradients[i % logoGradients.length],
    price,
    priceChange24h: (seededRand(i * 17) - 0.4) * 100,
    marketCap,
    volume24h,
    holders,
    launchTime: new Date(Date.now() - seededRand(i * 19) * 10000000000).toISOString(),
    isVerified,
    description: descriptions[i % descriptions.length],
    contractAddress: contractAddresses[i % contractAddresses.length],
    totalSupply: 1000000000,
    graduationTarget,
    bondingRaised,
  };
});

export function formatCurrency(value: number): string {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  if (value < 0.01) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export const mockTrades: Trade[] = Array.from({ length: 30 }).map((_, i) => {
  const token = mockTokens[i % mockTokens.length];
  const isBuy = seededRand(i * 23) > 0.4;
  const walletStart = Math.floor(seededRand(i * 29) * 0xffff).toString(16).padStart(4, "0");
  const walletEnd = Math.floor(seededRand(i * 31) * 0xffff).toString(16).padStart(4, "0");
  return {
    tokenId: token.ticker,
    type: isBuy ? "buy" : "sell",
    amount: Math.floor(seededRand(i * 37) * 1000000) + 1000,
    price: token.price,
    wallet: `0x${walletStart}...${walletEnd}`,
    time: new Date(Date.now() - seededRand(i * 41) * 3600000).toISOString(),
  };
});
