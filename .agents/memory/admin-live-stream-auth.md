---
name: Server-side live-stream admin auth
description: The live-stream publishing controls use a server-validated admin session rather than a browser-exposed password.
---

Live-stream settings updates and video upload URL generation must remain behind the HTTP-only admin session; public stream reads and playback stay unauthenticated.

**Why:** A `VITE_*` password is bundled into the browser and cannot protect mutation endpoints from direct API calls.

**How to apply:** Keep the `ADMIN_PASSWORD` secret server-only, use the existing `SESSION_SECRET` to sign the short-lived cookie, and do not reintroduce client-side password comparison for admin actions.