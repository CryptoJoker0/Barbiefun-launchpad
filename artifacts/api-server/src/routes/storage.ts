import { Readable } from "stream";
import { Router, type IRouter, type Request, type Response } from "express";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for logo and live video uploads.
 * Image uploads are public for token launches. Video uploads require an admin
 * session because they become part of the public livestream configuration.
 */
router.post(
  "/storage/uploads/request-url",
  (req: Request, res: Response, next) => {
    if (req.body?.contentType?.startsWith("video/")) {
      requireAdmin(req, res, next);
      return;
    }
    next();
  },
  async (req: Request, res: Response) => {
    const { name, size, contentType } = req.body ?? {};
    if (typeof name !== "string" || typeof size !== "number" || typeof contentType !== "string") {
      res.status(400).json({ error: "Missing or invalid fields: name, size, contentType" });
      return;
    }

    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");
    if (!isImage && !isVideo) {
      res.status(400).json({ error: "Only image and video uploads are accepted" });
      return;
    }

    const maxSize = isVideo ? 100 * 1024 * 1024 : 2 * 1024 * 1024;
    if (size > maxSize) {
      res.status(413).json({
        error: `File too large — maximum ${isVideo ? "100 MB" : "2 MB"}`,
      });
      return;
    }

    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
    } catch (error) {
      req.log.error({ err: error }, "Error generating upload URL");
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve uploaded token logos and live videos from PRIVATE_OBJECT_DIR.
 * Public — no auth needed; logos are intentionally public.
 */
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(objectFile);

    // Security: enforce browser cannot execute uploaded content.
    // Regardless of what the client declared at upload time, only serve
    // files whose stored content-type is a known safe image type.
    // Anything else is served as an inert attachment so browsers never
    // interpret it as HTML/JS on this origin.
    const storedContentType = response.headers.get("content-type") ?? "";
    const ALLOWED_MEDIA_TYPES = [
      "image/png", "image/jpeg", "image/gif", "image/webp",
      "image/svg+xml", "image/bmp", "image/tiff", "image/x-icon",
      "video/mp4", "video/webm", "video/ogg", "video/quicktime",
    ];
    const isAllowedMedia = ALLOWED_MEDIA_TYPES.some(
      (t) => storedContentType.startsWith(t),
    );

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'");

    if (!isAllowedMedia) {
      // Force inert download so unknown uploaded content cannot execute in-browser
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", "attachment");
    } else {
      res.setHeader("Content-Type", storedContentType);
    }

    res.status(response.status);
    // Copy remaining headers except Content-Type (already set above)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-type") {
        res.setHeader(key, value);
      }
    });

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
