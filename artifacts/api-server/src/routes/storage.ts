import { Readable } from "stream";
import { Router, type IRouter, type Request, type Response } from "express";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for logo upload.
 * No auth required — this is a public launchpad; anyone launching a token
 * may upload a logo. File size is capped at 2 MB server-side.
 */
router.post(
  "/storage/uploads/request-url",
  async (req: Request, res: Response) => {
    const { name, size, contentType } = req.body ?? {};
    if (typeof name !== "string" || typeof size !== "number" || typeof contentType !== "string") {
      res.status(400).json({ error: "Missing or invalid fields: name, size, contentType" });
      return;
    }

    if (size > 2 * 1024 * 1024) {
      res.status(413).json({ error: "File too large — maximum 2 MB" });
      return;
    }

    if (!contentType.startsWith("image/")) {
      res.status(400).json({ error: "Only image uploads are accepted" });
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
 * Serve uploaded token logos from PRIVATE_OBJECT_DIR.
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
    const ALLOWED_IMAGE_TYPES = [
      "image/png", "image/jpeg", "image/gif", "image/webp",
      "image/svg+xml", "image/bmp", "image/tiff", "image/x-icon",
    ];
    const isAllowedImage = ALLOWED_IMAGE_TYPES.some(
      (t) => storedContentType.startsWith(t),
    );

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'");

    if (!isAllowedImage) {
      // Force inert download so non-image uploads cannot execute in-browser
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
