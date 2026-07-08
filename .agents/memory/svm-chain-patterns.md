---
name: SVM chain integration patterns
description: How SVM chains (X1, Solana) are integrated in the Barbie Fun launchpad
---

## Chain IDs
- X1 Blockchain: `chainId = -1` (display-only, not EVM)
- Solana: `chainId = -2` (display-only, not EVM)

## SUPPORTED_CHAINS vs DISPLAY_CHAINS
- `SUPPORTED_CHAINS` — EVM only, safe to pass to wagmi `switchChain`
- `DISPLAY_CHAINS` — EVM + SVM, for UI display only
- Any component doing `SUPPORTED_CHAINS.find(c => c.id === launch.chainId)` will return `undefined` for SVM launches
- **Rule:** Always fall back: `SUPPORTED_CHAINS.find(...) ?? DISPLAY_CHAINS.find(...)`
- Files that need this: TokenCard, RecentLaunches, TokenDetail, Verify (review queue)

## Transaction signature validation
- Solana/X1 tx signatures are 64-byte Ed25519 encoded as base58
- Base58 of 64 bytes = exactly **87 or 88 characters**
- Correct regex: `/^[1-9A-HJ-NP-Za-km-z]{87,88}$/`
- Wrong (too permissive): `{44,90}` — also matches wallet addresses and public keys

## SVM fee payment flow (no @solana/web3.js)
- EVM: sendTransactionAsync via wagmi → auto confirmation
- SVM: show treasury address + fee amount → user sends from Phantom/Backpack → user pastes tx signature
- Treasury: `VITE_SOLANA_TREASURY_ADDRESS` env var (separate from EVM `VITE_LAUNCH_FEE_TREASURY_ADDRESS`)
- Submit gating: require `solana.connected && isValidSvmSig(sig)` (not just valid sig)

## Wallet connection
- EVM: wagmi hooks (useAccount, useSendTransaction, etc.)
- SVM: custom `useSolanaWallet` hook via window.phantom.solana / window.backpack.solana injections
- No @solana/wallet-adapter — too heavy, not installed
- SVM wallet shown in a separate "SVM Chains" tab in WalletModal

## Explorer URLs
- X1: `https://explorer.x1.xyz/tx/`
- Solana: `https://solscan.io/tx/`
