---
name: Video-js artifact workflow
description: Ordering requirement for video-js artifact creation, and a scaffold tsconfig gap that breaks typecheck.
---

Always call `createArtifact` (registering the artifact, kind video-js) BEFORE dispatching the design/video subagent to build it.

**Why:** dispatching the subagent first produced output with no `.replit-artifact` scaffold (no hooks.ts, animations.ts, index.css template, index.html), forcing a manual migration of the subagent's creative output into a freshly-scaffolded directory afterward.

**How to apply:** for any new video-js (or likely other artifact-kind) request, run the artifacts-skill `createArtifact` step first, then delegate to the subagent so it inherits the correct scaffold.

Separately: the video-js scaffold's generated `tsconfig.json` can omit `"lib": ["esnext", "dom", "dom.iterable"]` (present in other artifact types like react-vite), causing `window`/`document`/`HTMLAudioElement` typecheck failures once you add browser-facing code (e.g. scene-selector controls, audio wiring). Check for and add this lib array if `pnpm typecheck` reports "Cannot find name 'window'" or similar DOM errors.
