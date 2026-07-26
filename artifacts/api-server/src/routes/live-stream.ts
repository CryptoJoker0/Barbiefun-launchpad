import { Router } from "express";
import { db, liveStreamSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();
const SETTINGS_ID = "default";

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  isLive: false,
  title: "Barbie Fun Live",
  embedUrl: null,
  goLiveUrl: "https://t.me/barbiefunv2/65",
  videoObjectPath: null,
  videoTitle: null,
  updatedAt: new Date(0),
};

function optionalUrl(value: unknown, field: string): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error(`${field} must be a URL`);
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${field} must use http or https`);
  }
  return value;
}

router.get("/live-stream", async (_req, res) => {
  try {
    const [settings] = await db
      .select()
      .from(liveStreamSettingsTable)
      .where(eq(liveStreamSettingsTable.id, SETTINGS_ID));

    res.json(settings ?? DEFAULT_SETTINGS);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch live stream settings" });
  }
});

router.put("/live-stream", requireAdmin, async (req, res) => {
  try {
    const body = req.body ?? {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (title.length > 120) {
      res.status(400).json({ error: "Title must be 120 characters or fewer" });
      return;
    }

    const embedUrl = optionalUrl(body.embedUrl, "embedUrl");
    const goLiveUrl = optionalUrl(body.goLiveUrl, "goLiveUrl");
    const videoObjectPath =
      body.videoObjectPath == null || body.videoObjectPath === ""
        ? null
        : typeof body.videoObjectPath === "string" &&
            body.videoObjectPath.startsWith("/objects/")
          ? body.videoObjectPath
          : (() => {
              throw new Error("videoObjectPath must be an object storage path");
            })();
    const videoTitle =
      body.videoTitle == null || body.videoTitle === ""
        ? null
        : typeof body.videoTitle === "string"
          ? body.videoTitle.trim().slice(0, 160)
          : (() => {
              throw new Error("videoTitle must be text");
            })();

    const [settings] = await db
      .insert(liveStreamSettingsTable)
      .values({
        id: SETTINGS_ID,
        isLive: Boolean(body.isLive),
        title: title || DEFAULT_SETTINGS.title,
        embedUrl,
        goLiveUrl,
        videoObjectPath,
        videoTitle,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: liveStreamSettingsTable.id,
        set: {
          isLive: Boolean(body.isLive),
          title: title || DEFAULT_SETTINGS.title,
          embedUrl,
          goLiveUrl,
          videoObjectPath,
          videoTitle,
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid live stream settings";
    if (message.includes("URL") || message.includes("url") || message.includes("Path") || message.includes("text")) {
      res.status(400).json({ error: message });
      return;
    }
    req.log.error({ err: error }, "Error saving live stream settings");
    res.status(500).json({ error: "Failed to save live stream settings" });
  }
});

export default router;