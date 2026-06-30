/**
 * Mounts Light inside `#fig-code-root` on public/index.html (light static export).
 * Uses createRoot + render instead of hydrateRoot: static HTML from `renderToStaticMarkup` can differ
 * from the client’s first paint in subtle ways (attributes, HTML repair, CSS-in-JS strings), which triggers
 * React #418 hydration errors. Client render replaces the prerendered subtree; no-JS users still see HTML.
 * Built by: vite build --config vite.light-client.config.ts (via npm run build:light).
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Light from "./Light";

const el = document.getElementById("fig-code-root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <Light staticExport />
    </StrictMode>,
  );
}
