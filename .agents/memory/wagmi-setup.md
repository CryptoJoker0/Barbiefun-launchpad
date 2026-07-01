---
name: Wagmi v2 in launchpad devDependencies
description: wagmi/viem install rules in the launchpad artifact to avoid TS resolution and version conflicts.
---

## Rule
In `artifacts/launchpad/package.json`, wagmi and viem must be in **devDependencies** (not dependencies) and pinned to exact v2: `"wagmi": "2.19.5"`, `"viem": "2.53.1"`.

## Why
- Vite static apps: all packages belong in devDependencies or tsc cannot resolve them.
- `pnpm add wagmi` installs v3 (latest) which breaks @rainbow-me/rainbowkit 2.x compatibility.
- Packages in `dependencies` on a static app cause "Cannot find module" tsc errors even when present in pnpm store.

## How to apply
Always put blockchain packages in devDependencies with exact v2 version strings. After any package.json change run `pnpm install` (workspace root), then `pnpm --filter @workspace/launchpad run typecheck`.
