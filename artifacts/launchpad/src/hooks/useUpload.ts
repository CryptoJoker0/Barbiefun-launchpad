/**
 * Lightweight upload hook — two-step presigned URL flow.
 * 1. POST /api/storage/uploads/request-url (JSON metadata → presigned URL)
 * 2. PUT presigned URL (file bytes → GCS directly)
 *
 * No Uppy dependency — uses native fetch only.
 */
import { useCallback, useState } from "react";

interface UploadResponse {
  uploadURL: string;
  objectPath: string;
  metadata: { name: string; size: number; contentType: string };
}

interface UseUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);
      try {
        // Step 1: get presigned URL
        setProgress(15);
        const metaRes = await fetch("/api/storage/uploads/request-url", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          }),
        });
        if (!metaRes.ok) {
          const err = await metaRes.json().catch(() => ({}));
          throw new Error((err as any).error ?? "Failed to get upload URL");
        }
        const uploadResponse: UploadResponse = await metaRes.json();

        // Step 2: PUT file directly to GCS
        setProgress(40);
        const putRes = await fetch(uploadResponse.uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        if (!putRes.ok) throw new Error("Failed to upload file to storage");

        setProgress(100);
        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Upload failed");
        setError(e);
        options.onError?.(e);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options],
  );

  return { uploadFile, isUploading, progress, error };
}
