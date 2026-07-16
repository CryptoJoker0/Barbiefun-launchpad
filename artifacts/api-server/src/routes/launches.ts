import { Router } from "express";
import { db, launchesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

/** Escape HTML entities to prevent injection in OG card HTML */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── GET /launches ────────────────────────────────────────────────────────────
router.get("/launches", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(launchesTable)
      .orderBy(desc(launchesTable.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch launches" });
  }
});

// ── POST /launches ────────────────────────────────────────────────────────────
router.post("/launches", async (req, res) => {
  try {
    const b = req.body;
    if (!b.id || !b.name || !b.ticker || b.chainId == null || !b.deployer || !b.feeTxHash) {
      return res.status(400).json({ error: "Missing required fields: id, name, ticker, chainId, deployer, feeTxHash" });
    }

    const [launch] = await db
      .insert(launchesTable)
      .values({
        id: String(b.id),
        name: String(b.name),
        ticker: String(b.ticker),
        description: b.description ? String(b.description) : "",
        website: b.website ? String(b.website) : null,
        twitter: b.twitter ? String(b.twitter) : null,
        telegram: b.telegram ? String(b.telegram) : null,
        totalSupply: b.totalSupply ? String(b.totalSupply) : "0",
        chainId: Number(b.chainId),
        chainName: b.chainName ? String(b.chainName) : "",
        deployer: String(b.deployer),
        feeTxHash: String(b.feeTxHash),
        verified: Boolean(b.verified ?? false),
        mintAuthority: Boolean(b.mintAuthority ?? true),
        freezeAuthority: Boolean(b.freezeAuthority ?? false),
        referredBy: b.referredBy ? String(b.referredBy) : null,
      })
      .returning();

    res.status(201).json(launch);
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "A launch with this ID already exists" });
    }
    res.status(500).json({ error: "Failed to create launch" });
  }
});

// ── GET /launches/:id ─────────────────────────────────────────────────────────
router.get("/launches/:id", async (req, res) => {
  try {
    const [launch] = await db
      .select()
      .from(launchesTable)
      .where(eq(launchesTable.id, req.params.id));
    if (!launch) return res.status(404).json({ error: "Launch not found" });
    res.json(launch);
  } catch {
    res.status(500).json({ error: "Failed to fetch launch" });
  }
});

// ── PATCH /launches/:id/verify ────────────────────────────────────────────────
router.patch("/launches/:id/verify", async (req, res) => {
  try {
    const verified = Boolean(req.body.verified);
    const [updated] = await db
      .update(launchesTable)
      .set({ verified })
      .where(eq(launchesTable.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Launch not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update launch" });
  }
});

// ── GET /og/:id — Social-share OG card HTML ───────────────────────────────────
// Crawlers (Twitter, Telegram, Discord) fetch this URL and parse OG meta tags.
// Real users get an immediate meta-refresh redirect to the SPA token page.
router.get("/og/:id", async (req, res) => {
  try {
    const [launch] = await db
      .select()
      .from(launchesTable)
      .where(eq(launchesTable.id, req.params.id));
    if (!launch) return res.status(404).send("Launch not found");

    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : `${req.protocol}://${req.get("host") ?? "localhost"}`;

    const title = esc(`$${launch.ticker} — ${launch.name} | Barbie Fun`);
    const rawDesc = launch.description?.trim() || `${launch.name} launched on ${launch.chainName} via Barbie Fun. Fair launch, $5 fee.`;
    const desc = esc(rawDesc.slice(0, 200));
    const imageUrl = esc(`${baseUrl}/barbie-fun-banner.png`);
    const tokenUrl = esc(`${baseUrl}/token/${launch.id}`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${tokenUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@BARBIEFUNV2" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta http-equiv="refresh" content="0;url=${tokenUrl}" />
</head>
<body>
  Redirecting to <a href="${tokenUrl}">${tokenUrl}</a>…
</body>
</html>`);
  } catch {
    res.status(500).send("Server error");
  }
});

export default router;
