# VizNow Marketing Site

VizNow official website, homepage, and marketing pages built with Next.js, React, TypeScript, and Tailwind-compatible CSS.

The current public entrypoints are:

- `/` - primary marketing homepage
- `/light` - same marketing experience kept as a stable compatibility path
- `/privacy-policy.html` and `/terms-service.html` - static legal pages served from `public/`

## Architecture

- `app/layout.tsx` defines the shared Next.js document shell and metadata.
- `app/page.tsx` and `app/light/page.tsx` render the marketing page.
- `src/marketing/MarketingPage.tsx` mounts the marketing-only client shell.
- `src/light/*` contains the existing pixel-sensitive marketing page implementation.
- `app/marketing.css` imports the generated Light page styles in the same order used by the static export.

The Next.js entry intentionally does not mount the older Studio/app router tree. Keep this package focused on public marketing pages unless the project scope changes explicitly.

## Visual Fidelity

Pixel-level consistency is a release requirement for marketing pages.

Before visual changes, capture the current page as the baseline. After changes, compare the same routes and viewport sizes:

- `1440x900`
- `1280x800`
- `768x1024`
- `390x844`

Dynamic video frames and timed animations may need a fixed wait or mask, but layout, spacing, typography, colors, stacking, and first-screen composition should match the baseline.

## Environment

Use public Next.js environment variables only:

- `NEXT_PUBLIC_APP_ENV`: optional public deployment label
- `NEXT_PUBLIC_SITE_URL`: canonical site origin, for example `https://viznow.ai`
- `NEXT_PUBLIC_STATIC_BASE_URL`: optional static asset origin
- `NEXT_PUBLIC_MIXPANEL_TOKEN`: optional public analytics token

Private values belong in `.env.local` or Vercel environment settings and must not be committed.

## Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test:lib
```

Vercel should use the default Next.js build command:

```bash
pnpm build
```

## Editing Notes

- Keep the first screen recognizable and stable across desktop and mobile.
- Prefer changing existing Light page primitives over introducing a parallel page implementation.
- Preserve public static paths and SEO metadata unless a redirect plan exists.
- Do not add application workflow details to this marketing-site documentation.
