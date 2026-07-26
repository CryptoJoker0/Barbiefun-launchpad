/**
 * x1.ts — Server-side proxy for x1scr.xyz token data.
 *
 * x1scr.xyz blocks browser-side fetches (CORS + 403), but responds
 * normally to server-side requests. This route fetches the token list
 * and XNT price from x1scr.xyz and returns it to the frontend.
 *
 * GET /x1/tokens — returns { xntUsd, tokens[] }
 */

import { Router } from "express";

const router = Router();

const X1SCR_API = "https://x1scr.xyz/api/tokens";
const CACHE_TTL_MS = 30_000; // 30 s

type CachedResponse = {
  data: unknown;
  fetchedAt: number;
};

let cache: CachedResponse | null = null;

router.get("/x1/tokens", async (req, res) => {
  // Serve cached response if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    res.json(cache.data);
    return;
  }

  try {
    const upstream = await fetch(X1SCR_API, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; BarbieFun/1.0)",
        Referer: "https://x1scr.xyz/",
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!upstream.ok) {
      res.status(502).json({ error: `x1scr.xyz returned ${upstream.status}` });
      return;
    }

    const raw = (await upstream.json()) as {
      xntUsd?: number;
      tokens?: unknown[];
    };

    const payload = {
      xntUsd: raw.xntUsd ?? null,
      tokens: (raw.tokens ?? []).slice(0, 50),
    };

    cache = { data: payload, fetchedAt: Date.now() };
    res.json(payload);
  } catch (err) {
    // Return stale cache rather than a hard error if we have one
    if (cache) {
      res.json(cache.data);
      return;
    }
    res.status(502).json({ error: "x1scr.xyz unavailable" });
  }
});

/** Proxy token logo images from x1scr.xyz (blocked by CORS client-side) */
router.get("/x1/logo", async (req, res) => {
  const mint = req.query["mint"];
  if (!mint || typeof mint !== "string") {
    res.status(400).json({ error: "mint required" });
    return;
  }

  try {
    const upstream = await fetch(
      `https://x1scr.xyz/api/logo?mint=${encodeURIComponent(mint)}&v=2`,
      {
        headers: {
          Accept: "image/webp,image/*,*/*",
          Referer: "https://x1scr.xyz/",
          "User-Agent": "Mozilla/5.0 (compatible; BarbieFun/1.0)",
        },
        signal: AbortSignal.timeout(6_000),
      }
    );

    if (!upstream.ok) {
      res.status(404).json({ error: "logo not found" });
      return;
    }

    const contentType = upstream.headers.get("content-type") ?? "image/webp";
    const buffer = await upstream.arrayBuffer();

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400"); // cache 24h
    res.send(Buffer.from(buffer));
  } catch {
    res.status(502).json({ error: "logo fetch failed" });
  }
});

export default router;
