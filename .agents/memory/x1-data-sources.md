---
name: X1 token data sources
description: What APIs exist for X1 Blockchain token/price data and what actually works
---

## x1scr.xyz
- Returns `{"error":"forbidden"}` from curl (403 via Cloudflare)
- Blocks browser CORS requests from localhost with no `Access-Control-Allow-Origin` header
- The site is an Express + Cloudflare app but has no documented public REST API
- **Verdict: unusable as a data source**

## DexScreener
- Does not index X1 Blockchain — tried chain slugs "xone", "x1", "x1blockchain"
- Search endpoint returns 0 X1 pairs
- **Verdict: unusable for X1**

## FortiBlox Explorer
- URL: https://explorer.fortiblox.com
- No `/api/v2/stats` or `/api/v2/tokens` — returns Express "Cannot GET" 404
- **Verdict: no usable REST API found**

## X1 Oracle
- URL: https://x1oracle.com/api/price — returns 404
- **Verdict: no usable price API found**

## Current approach
X1TokenTracker component attempts all known endpoints in order (x1scr.xyz paths → DexScreener chain IDs), then falls back to a graceful "data unavailable" UI that links the user directly to x1scr.xyz, x1oracle.com, and FortiBlox Explorer.

**Why:** All known X1 data sources either block CORS or have no public endpoints as of July 2026. The fallback UI is honest and actionable.

**How to apply:** Any future X1 price/token feature should either proxy through a backend or wait for x1scr.xyz to expose a CORS-enabled API.
