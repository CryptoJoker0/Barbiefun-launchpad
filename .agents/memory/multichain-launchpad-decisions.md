---
name: Multi-chain launchpad decisions
description: Architecture decisions for chain support, wallet modal, and UI patterns in the Barbie Fun launchpad
---

## EVM vs SVM chain separation

**Rule:** `SUPPORTED_CHAINS` is EVM-only and safe for wagmi `switchChain`. `DISPLAY_CHAINS` = SUPPORTED_CHAINS + SVM entries (id=-1 for X1, id=-2 for Solana). Never pass DISPLAY_CHAINS to switchChain.

**Why:** wagmi will throw if given a chain not in its config; SVM chains can't be switched via wagmi at all.

**How to apply:** Any new chain: add to wagmiConfig+SUPPORTED_CHAINS if EVM, add as `{ id: negative-unique, isSvm: true }` entry in DISPLAY_CHAINS if SVM.

---

## Ethereum → Base migration

Base replaced mainnet Ethereum. Chain ID is **8453**, native token is ETH (same CoinGecko ID "ethereum"). RPC: `https://mainnet.base.org`, explorer: `https://basescan.org/tx/`. The CHAIN_EXPLORERS map in Launch.tsx uses 8453, not 1.

---

## Solana integration

Solana is a display-only SVM chain (id=-2). Uses Phantom/Backpack via `useSolanaWallet` hook (window.phantom/window.backpack injections). Wallet modal tab renamed "SVM Chains" — covers both X1 and Solana. Jupiter (jup.ag) is the Solana DEX. Portal (portalbridge.com) is the Solana bridge.

---

## NativeTokenPrices replaces LiveTerminal

Single CoinGecko batched request for binancecoin,ethereum,okb,solana. Stable gas tokens (USD/Tempo, USDC/Arc) always show $1.0000. XN (X1) has no public price feed — shows "—". Refetches every 60s, staleTime 45s.

---

## Admin dashboard security

VITE_ADMIN_PASSWORD check is a UX deterrent only — VITE_ vars are in the client bundle. Real auth requires a backend. This is documented with a comment in Admin.tsx. No action needed unless a backend is added.

---

## Treasury address

VITE_LAUNCH_FEE_TREASURY_ADDRESS is a plain env var (not a Replit Secret) since it's a public wallet address, not a credential.

---

## PlusChain network identity

**Rule:** The product labels the chain PlusChain, while its confirmed network endpoints use the PulseChain branding: chain ID **369**, native token **PLS**, RPC `rpc.pulsechain.com`, PulseScan, and PulseX.

**Why:** The user supplied these exact network values after the previous Tempo/Arc configuration proved incorrect.

**How to apply:** Keep PlusChain on the EVM/wagmi path and use the PulseChain-branded RPC, explorer, and DEX URLs for wallet switching and transaction links.
