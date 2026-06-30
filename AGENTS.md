# VizNow Marketing Site AI Guide

## Role

This package is the Next.js/Vercel marketing site for VizNow. It covers the public official website, homepage, and marketing pages.

## Scope

- Maintain `/`, `/light`, and public static marketing assets.
- Keep the Next.js entry marketing-only.
- Do not route public pages through the older Studio/app shell unless the scope is explicitly changed.
- Keep private application workflows out of public marketing documentation.

## Architecture

- `app/layout.tsx` owns metadata and the shared document shell.
- `app/page.tsx` and `app/light/page.tsx` mount the public marketing page.
- `src/marketing/MarketingPage.tsx` is the client shell used by the Next.js routes.
- `src/light/*` contains the existing pixel-sensitive marketing implementation.
- `app/marketing.css` imports Light page CSS in the order needed for visual parity.

## Visual Rule

Marketing pages must remain pixel-aligned with the approved baseline. For visible UI changes, verify desktop and mobile screenshots when a local or deployed target is available.

Recommended viewports:

- `1440x900`
- `1280x800`
- `768x1024`
- `390x844`

Dynamic video frames and timed animations may be masked or captured after a fixed wait; layout, color, type, spacing, and first-screen composition should stay aligned.

## Environment

- Use `NEXT_PUBLIC_*` variables for public configuration.
- Keep local private overrides in `.env.local`.
- Do not commit secrets or local machine values.

## Validation

- Static check: `pnpm lint`
- Build: `pnpm build`
- Focused library tests: `pnpm test:lib`

If the user asks not to run locally, edit files only and state that validation was skipped by request.
