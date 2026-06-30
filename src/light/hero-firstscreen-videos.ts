/** OSS origin for hero first-screen mp4 — shared by Light.tsx and scripts/build-light-html.ts (head hints). */
export const LIGHT_HERO_VIDEO_ORIGIN = "https://zhiyingguangnian.oss-us-west-1.aliyuncs.com";

/** Hero collage videos (5). Index order matches `HERO_CYCLE_PROMPTS` in Light.tsx (hero-v01 … hero-v05). */
export const HERO_COLLAGE_VIDEOS = [
  {
    key: "hero-v01",
    src: `${LIGHT_HERO_VIDEO_ORIGIN}/website/public/static/hero_01.mp4`,
    mobilePosterSrc: "/light-assets/hero-posters/hero_01_mobile_poster.webp",
  },
  {
    key: "hero-v02",
    src: `${LIGHT_HERO_VIDEO_ORIGIN}/website/public/static/hero_02.mp4`,
    mobilePosterSrc: "/light-assets/hero-posters/hero_02_mobile_poster.webp",
  },
  {
    key: "hero-v03",
    src: `${LIGHT_HERO_VIDEO_ORIGIN}/website/public/static/hero_03.mp4`,
    mobilePosterSrc: "/light-assets/hero-posters/hero_03_mobile_poster.webp",
  },
  {
    key: "hero-v04",
    src: `${LIGHT_HERO_VIDEO_ORIGIN}/website/public/static/hero_04.mp4`,
    mobilePosterSrc: "/light-assets/hero-posters/hero_04_mobile_poster.webp",
  },
  {
    key: "hero-v05",
    src: `${LIGHT_HERO_VIDEO_ORIGIN}/website/public/static/hero_05.mp4`,
    mobilePosterSrc: "/light-assets/hero-posters/hero_05_mobile_poster.webp",
  },
] as const;

const LIGHT_HERO_HEAD_HINT_MARKER = "data-light-hero-head-hints";

const DESKTOP_HERO_MEDIA_QUERY = "(min-width: 768px)";

/** SSR `public/index.html` head: dns-prefetch, preconnect, and desktop-only preload for hero mp4s. */
export function buildLightHeroHeadHintsHtml(escapeAttr: (value: string) => string): string {
  return `
<link rel="dns-prefetch" href="${escapeAttr(LIGHT_HERO_VIDEO_ORIGIN)}" />
<link rel="preconnect" href="${escapeAttr(LIGHT_HERO_VIDEO_ORIGIN)}" crossorigin />
${HERO_COLLAGE_VIDEOS.map(
  (v) =>
    `<link rel="preload" as="video" href="${escapeAttr(v.src)}" fetchpriority="high" media="${DESKTOP_HERO_MEDIA_QUERY}" />`,
).join("\n")}
`;
}

/** SPA `/light` preview: inject the same head hints as early as possible. */
export function mountLightHeroHeadHints(doc: Document = document): () => void {
  const links: HTMLLinkElement[] = [];

  const append = (
    rel: string,
    href: string,
    opts?: { as?: string; crossOrigin?: "" | "anonymous" | "use-credentials"; fetchPriority?: "high" },
  ) => {
    const link = doc.createElement("link");
    link.rel = rel;
    link.href = href;
    link.setAttribute(LIGHT_HERO_HEAD_HINT_MARKER, "");
    if (opts?.as) link.as = opts.as;
    if (opts?.crossOrigin !== undefined) link.crossOrigin = opts.crossOrigin;
    if (opts?.fetchPriority) link.setAttribute("fetchpriority", opts.fetchPriority);
    doc.head.appendChild(link);
    links.push(link);
  };

  append("dns-prefetch", LIGHT_HERO_VIDEO_ORIGIN);
  append("preconnect", LIGHT_HERO_VIDEO_ORIGIN, { crossOrigin: "anonymous" });
  for (const { src } of HERO_COLLAGE_VIDEOS) {
    append("preload", src, { as: "video", fetchPriority: "high" });
    links[links.length - 1]!.media = DESKTOP_HERO_MEDIA_QUERY;
  }

  return () => {
    for (const link of links) link.remove();
  };
}
