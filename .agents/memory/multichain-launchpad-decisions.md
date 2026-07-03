---
name: Multi-chain launchpad EVM/non-EVM boundary decisions
description: How to handle SVM chains and unannounced mainnet chain IDs in an EVM wagmi-based launchpad.
---

## Rule
When a target chain runs on a non-EVM VM (e.g. X1 Blockchain on SVM), do not force it into the wagmi `chains`/connector config. Exclude it entirely from `wagmiConfig`, keep it out of wallet-connect flows, and instead surface it as a clearly-labeled "needs a different wallet type" card/notice with a link to its official bridge. Trying to fake EVM compatibility for an SVM chain produces broken connect flows.

**Why:** wagmi/MetaMask/WalletConnect only speak Ethereum JSON-RPC (EIP-155). A chain without a numeric EIP-155 chain ID (e.g. Solana-based X1) cannot be added as a wagmi `Chain` no matter how it's configured — connect attempts will silently fail or throw.

**How to apply:** Define a plain metadata object (name, symbol, RPC, explorer, bridge URL, required wallets, reason) for the non-EVM chain, and reference it in UI empty-states/disabled-cards instead of adding it to the chains array.

## Rule
When a chain's mainnet hasn't publicly launched/announced a chain ID yet (e.g. Circle Arc as of mid-2026), wire the app to the chain's live public testnet under the mainnet's product name, and leave a code comment stating exactly what to swap when the real mainnet ID is published. Don't block the whole integration waiting on an announcement.

**Why:** keeps the app fully functional end-to-end today while making the future swap a one-line change instead of a re-architecture.

## Rule
Launch-fee treasury wallet addresses (public, non-secret) belong in plain env vars (e.g. `VITE_LAUNCH_FEE_TREASURY_ADDRESS`), not secrets — they're meant to be visible on-chain anyway. Ask the user for them directly via a normal question, not `requestEnvVar`.
