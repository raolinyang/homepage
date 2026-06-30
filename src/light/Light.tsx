import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import svgPaths from "./svg-qbnl8vsnf0";
import { HERO_COLLAGE_VIDEOS } from "./hero-firstscreen-videos";
import { MarketingAuthLink } from "./MarketingAuthLink";
import { LightMobilePcStudioDialog } from "./LightMobilePcStudioDialog";
import { VizNowAiLogo } from "./VizNowAiLogo";

const LightBelowFoldLazy = lazy(() => import("./LightBelowFold"));

/** Hero prompts: index order matches `HERO_COLLAGE_VIDEOS` keys hero-v01 … hero-v05. */
const HERO_CYCLE_PROMPTS = [
  `Create a dynamic visual emphasis sequence, automatically highlighting key phrases and co-writing kinetic typography that syncs perfectly with the speaker's narrative beats.`,
  `Analyze my footage, match the pacing to a high-retention YouTube style, and auto-insert relevant motion graphics.`,
  `Identify key statistics in my footage and create dynamic, full-screen data overlays that pop up exactly when I mention them.`,
  `Apply professional motion graphics to emphasize my key takeaways; insert modern, sleek text callouts that highlight the 'A-ha!' moments in my story.`,
  `Analyze the rhythm of my voiceover and insert visually aesthetic, on-brand motion graphics to keep the narrative feeling fresh and dynamic.`,
] as const;

type HeroRestRect = { left: number; top: number; w: number; h: number; r: number; z?: number };

/** Hero video / card aspect (design source 1180×664). All collage tiles use this ratio. */
const HERO_VIDEO_AR_W = 1180;
const HERO_VIDEO_AR_H = 664;

function heroHeightFromWidth(w: number): number {
  return (w * HERO_VIDEO_AR_H) / HERO_VIDEO_AR_W;
}

/** Visual scale vs original Figma tile sizes (190px / 328px spotlight). */
const HERO_CARD_SCALE = 1.2;

/** 1440px artboard: `50%` of hero = 720px from left. */
const HERO_ARTBOARD_HALF = 720;
/** Original spotlight: `calc(50% + 182px)` with width 328 — center X fixed when scaling width. */
const HERO_SPOTLIGHT_LEFT_OFFSET_BASE = 182;
const HERO_SPOTLIGHT_W_BASE = 328;

/** Nudge collage + spotlight together vs original Figma 676–1398 band. */
const HERO_COLLAGE_SHIFT_X = 20;

const HERO_SPOTLIGHT_CENTER_X =
  HERO_ARTBOARD_HALF + HERO_SPOTLIGHT_LEFT_OFFSET_BASE + HERO_SPOTLIGHT_W_BASE / 2 + HERO_COLLAGE_SHIFT_X;

/** Uniform satellite width (px); height derived from `HERO_VIDEO_AR_*`. */
const HERO_TILE_W = 190 * HERO_CARD_SCALE;
const HERO_TILE_H = heroHeightFromWidth(HERO_TILE_W);
const HERO_TILE_R = 18 * HERO_CARD_SCALE;

/** Spotlight width (px); height matches video aspect. */
const HERO_SPOTLIGHT_W = HERO_SPOTLIGHT_W_BASE * HERO_CARD_SCALE;

/** Keeps spotlight centered at `HERO_SPOTLIGHT_CENTER_X` when width changes. */
const HERO_SPOTLIGHT_LEFT_OFFSET = HERO_SPOTLIGHT_CENTER_X - HERO_ARTBOARD_HALF - HERO_SPOTLIGHT_W / 2;

/**
 * Spotlight AABB on 1440-wide artboard — must match `HERO_SPOTLIGHT_STYLE` (50% = 720px).
 * Horizontal: `l` = 720 + `HERO_SPOTLIGHT_LEFT_OFFSET`; vertical top 245 (nudged vs prompt / controls).
 */
const HERO_SPOTLIGHT_NUM = {
  l: HERO_ARTBOARD_HALF + HERO_SPOTLIGHT_LEFT_OFFSET,
  t: 245,
  w: HERO_SPOTLIGHT_W,
  h: heroHeightFromWidth(HERO_SPOTLIGHT_W),
};

/**
 * AABB of bottom-docked Frame42 (blur card + prompt + toolbar), ~890px artboard height.
 * Match horizontal centering with `Frame42`; keep narrow so right-column satellites stay valid.
 */
const HERO_PROMPT_BOX_NUM = (() => {
  const gutter = 80;
  const artboard = 1440;
  const inner = artboard - 2 * gutter;
  const frame42w = Math.min(770, inner - 160);
  const frame42Left = gutter + (inner - frame42w) / 2;
  const heroRefH = 890;
  const dockPb = 0;
  const cardOuterH = 252;
  const t = heroRefH - dockPb - cardOuterH;
  return { l: frame42Left, t, w: frame42w, h: cardOuterH };
})();

/** Max fraction of a satellite’s area that may sit under the spotlight rect (spotlight left/up nudge widens overlap). */
const HERO_MAX_OCCLUSION = 0.35;

/** Max fraction of a satellite’s area that may sit under the hero prompt field. */
const HERO_MAX_PROMPT_COVER = 0.3;

/**
 * Lower-left band on the artboard (prompt card + controls) — keep tiles mostly out of this corner.
 * Intersection / tile area must stay ≤ `HERO_MAX_BOTTOM_LEFT_COVER`.
 */
/** Right band of the 1440 artboard (headline left of `left`); `bottomMax` shortened from 890; `HERO_COLLAGE_SHIFT_X` nudges right. */
const HERO_COLLAGE_AREA = {
  left: 676 + HERO_COLLAGE_SHIFT_X,
  top: 100,
  rightMax: 1398 + HERO_COLLAGE_SHIFT_X,
  bottomMax: 690,
} as const;

const HERO_BOTTOM_LEFT_AVOID = { l: HERO_COLLAGE_AREA.left, t: 568, w: 270, h: 318 };
const HERO_MAX_BOTTOM_LEFT_COVER = 0.1;

/** Min distance between any two satellite centers — higher = more spread, less clustering. */
const HERO_MIN_SAT_CENTER_DIST = 200 * HERO_CARD_SCALE;

/** Min width/height of the axis-aligned bounding box of the five tile top-left corners — rejects tight clumps. */
const HERO_LAYOUT_MIN_SPAN_L = 120;
const HERO_LAYOUT_MIN_SPAN_T = 135;

/**
 * Clock angle from spotlight center to satellite center: 0 at 12 o'clock, clockwise (screen coords).
 * Used to keep default tiles out of the 5–8 o'clock wedge (lower-right → bottom → bottom-left of the highlight).
 */
function heroSatelliteClockAngleFromSpotlight12(sat: HeroRestRect): number {
  const cx = HERO_SPOTLIGHT_NUM.l + HERO_SPOTLIGHT_NUM.w / 2;
  const cy = HERO_SPOTLIGHT_NUM.t + HERO_SPOTLIGHT_NUM.h / 2;
  const vx = sat.left + sat.w / 2 - cx;
  const vy = sat.top + sat.h / 2 - cy;
  let θ = Math.atan2(vx, -vy);
  if (θ < 0) θ += 2 * Math.PI;
  return θ;
}

/** 5–8 o'clock inclusive: θ from 12 CW in `heroSatelliteClockAngleFromSpotlight12` is [5π/6, 4π/3]. */
function heroSatelliteInSpotlightClockSector5to8(sat: HeroRestRect): boolean {
  const θ = heroSatelliteClockAngleFromSpotlight12(sat);
  return θ >= (5 * Math.PI) / 6 - 1e-9 && θ <= (4 * Math.PI) / 3 + 1e-9;
}

function heroIntersectionArea(a: HeroRestRect, b: { l: number; t: number; w: number; h: number }): number {
  const ar = a.left + a.w;
  const ab = a.top + a.h;
  const br = b.l + b.w;
  const bb = b.t + b.h;
  const iw = Math.max(0, Math.min(ar, br) - Math.max(a.left, b.l));
  const ih = Math.max(0, Math.min(ab, bb) - Math.max(a.top, b.t));
  return iw * ih;
}

function heroSatelliteOcclusionRatio(sat: HeroRestRect): number {
  const area = sat.w * sat.h;
  if (area <= 0) return 1;
  return heroIntersectionArea(sat, HERO_SPOTLIGHT_NUM) / area;
}

function heroSatellitePromptCoverRatio(sat: HeroRestRect): number {
  const area = sat.w * sat.h;
  if (area <= 0) return 1;
  return heroIntersectionArea(sat, HERO_PROMPT_BOX_NUM) / area;
}

function heroSatelliteBottomLeftOverlapRatio(sat: HeroRestRect): number {
  const area = sat.w * sat.h;
  if (area <= 0) return 1;
  return heroIntersectionArea(sat, HERO_BOTTOM_LEFT_AVOID) / area;
}

function heroMinSatelliteCenterDistance(rects: readonly HeroRestRect[]): number {
  const pts = rects.map((r) => ({ x: r.left + r.w / 2, y: r.top + r.h / 2 }));
  let m = Number.POSITIVE_INFINITY;
  for (let i = 0; i < pts.length; i += 1) {
    for (let j = i + 1; j < pts.length; j += 1) {
      const dx = pts[i]!.x - pts[j]!.x;
      const dy = pts[i]!.y - pts[j]!.y;
      m = Math.min(m, Math.hypot(dx, dy));
    }
  }
  return m;
}

/** Pixel area where two satellite tiles intersect (outer AABB). Must stay 0 — inset-only checks allowed false “non-overlap”. */
function heroSatelliteOuterOverlapArea(a: HeroRestRect, b: HeroRestRect): number {
  const ar = a.left + a.w;
  const ab = a.top + a.h;
  const br = b.left + b.w;
  const bb = b.top + b.h;
  const iw = Math.max(0, Math.min(ar, br) - Math.max(a.left, b.left));
  const ih = Math.max(0, Math.min(ab, bb) - Math.max(a.top, b.top));
  return iw * ih;
}

/** Reject “one long row” / “one long column” / tight grid. */
function heroLayoutHasSpatialVariety(rects: readonly HeroRestRect[]): boolean {
  const lefts = rects.map((r) => r.left);
  const tops = rects.map((r) => r.top);
  const minL = Math.min(...lefts);
  const maxL = Math.max(...lefts);
  const minT = Math.min(...tops);
  const maxT = Math.max(...tops);
  if (maxL - minL < HERO_LAYOUT_MIN_SPAN_L) return false;
  if (maxT - minT < HERO_LAYOUT_MIN_SPAN_T) return false;
  for (let i = 0; i < tops.length; i += 1) {
    const sameRow = tops.filter((t) => Math.abs(t - tops[i]!) < 38).length;
    if (sameRow >= 4) return false;
  }
  for (let i = 0; i < lefts.length; i += 1) {
    const sameCol = lefts.filter((x) => Math.abs(x - lefts[i]!) < 34).length;
    if (sameCol >= 4) return false;
  }
  return true;
}

function heroLayoutIsValid(rects: readonly HeroRestRect[]): boolean {
  if (rects.length !== 5) return false;
  for (const r of rects) {
    if (
      r.left < HERO_COLLAGE_AREA.left ||
      r.top < HERO_COLLAGE_AREA.top ||
      r.left + r.w > HERO_COLLAGE_AREA.rightMax ||
      r.top + r.h > HERO_COLLAGE_AREA.bottomMax
    )
      return false;
    if (heroSatelliteOcclusionRatio(r) > HERO_MAX_OCCLUSION + 1e-6) return false;
    if (heroSatellitePromptCoverRatio(r) > HERO_MAX_PROMPT_COVER + 1e-6) return false;
    if (heroSatelliteBottomLeftOverlapRatio(r) > HERO_MAX_BOTTOM_LEFT_COVER + 1e-6) return false;
    if (heroSatelliteInSpotlightClockSector5to8(r)) return false;
  }
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      if (heroSatelliteOuterOverlapArea(rects[i]!, rects[j]!) > 0) return false;
    }
  }
  if (heroMinSatelliteCenterDistance(rects) + 1e-6 < HERO_MIN_SAT_CENTER_DIST) return false;
  return heroLayoutHasSpatialVariety(rects);
}

const mk = (left: number, top: number, z: number): HeroRestRect => ({
  left,
  top,
  w: HERO_TILE_W,
  h: HERO_TILE_H,
  r: HERO_TILE_R,
  z,
});

/**
 * Curated presets (14 + 10): overlap/occlusion/sector rules + **dispersion**
 * (`HERO_MIN_SAT_CENTER_DIST`, `HERO_LAYOUT_MIN_SPAN_*`). Picked for high mean pairwise center distance.
 */
const HERO_LAYOUT_PRESETS: readonly HeroRestRect[][] = [
  [mk(1174, 539, 12), mk(950, 119, 11), mk(699, 370, 14), mk(1190, 153, 13), mk(700, 103, 12)],
  [mk(944, 142, 12), mk(1185, 551, 11), mk(732, 418, 14), mk(707, 102, 13), mk(1184, 161, 12)],
  [mk(698, 168, 12), mk(698, 440, 11), mk(1178, 106, 14), mk(1138, 529, 13), mk(938, 114, 12)],
  [mk(1185, 524, 12), mk(696, 172, 11), mk(1188, 104, 14), mk(938, 122, 13), mk(730, 426, 12)],
  [mk(1165, 501, 12), mk(944, 102, 11), mk(1185, 158, 14), mk(696, 414, 13), mk(703, 104, 12)],
  [mk(1156, 521, 12), mk(940, 104, 11), mk(698, 126, 14), mk(1186, 171, 13), mk(700, 407, 12)],
  [mk(1166, 550, 12), mk(1186, 177, 11), mk(955, 111, 14), mk(753, 415, 13), mk(705, 113, 12)],
  [mk(745, 411, 12), mk(699, 160, 11), mk(949, 147, 14), mk(1190, 104, 13), mk(1138, 557, 12)],
  [mk(1165, 509, 12), mk(934, 109, 11), mk(714, 438, 14), mk(1178, 133, 13), mk(701, 184, 12)],
  [mk(700, 112, 12), mk(1184, 517, 11), mk(942, 159, 14), mk(1182, 145, 13), mk(704, 383, 12)],
  [mk(707, 436, 12), mk(1179, 126, 11), mk(936, 147, 14), mk(1136, 500, 13), mk(699, 107, 12)],
  [mk(1169, 526, 12), mk(698, 108, 11), mk(1185, 125, 14), mk(748, 393, 13), mk(938, 139, 12)],
  [mk(711, 379, 12), mk(1180, 540, 11), mk(1189, 196, 14), mk(947, 131, 13), mk(701, 136, 12)],
  [mk(950, 117, 12), mk(720, 407, 11), mk(1176, 501, 14), mk(1185, 174, 13), mk(701, 114, 12)],
];

/** Alternate fan-out presets (same rules). */
const HERO_RING_PRESETS: readonly HeroRestRect[][] = [
  [mk(934, 139, 12), mk(697, 185, 11), mk(1178, 154, 14), mk(727, 428, 13), mk(1156, 556, 12)],
  [mk(950, 128, 12), mk(1168, 504, 11), mk(713, 416, 14), mk(703, 103, 13), mk(1184, 214, 12)],
  [mk(945, 116, 12), mk(1142, 493, 11), mk(745, 417, 14), mk(1189, 104, 13), mk(701, 124, 12)],
  [mk(942, 132, 12), mk(1159, 520, 11), mk(698, 115, 14), mk(712, 377, 13), mk(1181, 162, 12)],
  [mk(1179, 531, 12), mk(945, 108, 11), mk(747, 349, 14), mk(1182, 176, 13), mk(697, 102, 12)],
  [mk(956, 108, 12), mk(1107, 511, 11), mk(704, 423, 14), mk(696, 148, 13), mk(1189, 170, 12)],
  [mk(944, 137, 12), mk(1171, 508, 11), mk(1189, 199, 14), mk(698, 170, 13), mk(708, 432, 12)],
  [mk(942, 102, 12), mk(1180, 483, 11), mk(700, 146, 14), mk(1180, 148, 13), mk(734, 418, 12)],
  [mk(1180, 166, 12), mk(699, 397, 11), mk(1130, 515, 14), mk(940, 108, 13), mk(701, 136, 12)],
  [mk(948, 146, 12), mk(1122, 522, 11), mk(748, 410, 14), mk(697, 107, 13), mk(1189, 122, 12)],
];

const HERO_ALL_LAYOUT_PRESETS: readonly HeroRestRect[][] = [...HERO_LAYOUT_PRESETS, ...HERO_RING_PRESETS];

function heroAssertPresetsValid(): void {
  for (let p = 0; p < HERO_LAYOUT_PRESETS.length; p += 1) {
    if (!heroLayoutIsValid(HERO_LAYOUT_PRESETS[p]!)) {
      throw new Error(`HERO_LAYOUT_PRESETS[${p}] failed validation`);
    }
  }
  for (let p = 0; p < HERO_RING_PRESETS.length; p += 1) {
    if (!heroLayoutIsValid(HERO_RING_PRESETS[p]!)) {
      throw new Error(`HERO_RING_PRESETS[${p}] failed validation`);
    }
  }
}
heroAssertPresetsValid();

/** Uniform integer in [0, n) — prefers `crypto.getRandomValues` for preset + slot shuffles. */
function heroRandomUintBelow(n: number): number {
  if (n <= 0) return 0;
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]! % n;
  }
  return Math.floor(Math.random() * n);
}

function heroShuffleSlots(layout: readonly HeroRestRect[]): HeroRestRect[] {
  const copy = layout.map((r) => ({ ...r }));
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = heroRandomUintBelow(i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Random preset (24 bases) + Fisher–Yates image→slot shuffle. */
function heroPickRandomRestLayout(): HeroRestRect[] {
  const idx = heroRandomUintBelow(HERO_ALL_LAYOUT_PRESETS.length);
  const base = HERO_ALL_LAYOUT_PRESETS[idx]!;
  return heroShuffleSlots(base);
}

function heroSsgRestLayout(): HeroRestRect[] {
  return HERO_LAYOUT_PRESETS[0]!.map((r) => ({ ...r }));
}

/** Main highlight — aligned with satellite cluster; same aspect as source video (1180/664). */
const HERO_SPOTLIGHT_STYLE: React.CSSProperties = {
  left: `calc(50% + ${HERO_SPOTLIGHT_LEFT_OFFSET}px)`,
  top: 245,
  width: HERO_SPOTLIGHT_W,
  height: heroHeightFromWidth(HERO_SPOTLIGHT_W),
  borderRadius: 24 * HERO_CARD_SCALE,
};

/** Typewriter duration per slide (kept at 5s so per-char cadence ≈ 5000 / promptLen — same feel as before). */
const HERO_TYPING_MS = 5_000;
/**
 * Per-slide total cycle (typing + hold-still until the spotlight video finishes its own playback).
 * Index aligned with `HERO_COLLAGE_VIDEOS` / `HERO_CYCLE_PROMPTS` (hero_01 … hero_05).
 */
const HERO_CYCLE_TOTAL_MS_BY_SLIDE = [13_000, 15_000, 9_000, 9_000, 15_000] as const;
/**
 * Where each spotlight video should freeze after it ends (seconds, default 0 = first frame).
 * hero_03 is special: hold on its 8.5s frame instead of the cold first frame.
 * Index aligned with `HERO_COLLAGE_VIDEOS`.
 */
const HERO_FREEZE_SEC_BY_SLIDE = [0, 0, 8.5, 0, 0] as const;
/** Brief beat after spotlight ends before next prompt/collage. */
const HERO_POST_PLAY_MS = 338;
/** Highlight image pulse loop period — use the longest slide so the keyframes stay smooth across all slides. */
const HERO_PLAYBACK_ANIM_MS = Math.max(...HERO_CYCLE_TOTAL_MS_BY_SLIDE);
/** Set true to show cycle / P# / video key chip on the prompt input (hero preview QA). */
const HERO_SHOW_PROMPT_MAP_PREVIEW = false;

/** Fly / layout morph — quick settle, slight overshoot. */
const HERO_TILE_EASE = "cubic-bezier(0.16,1,0.3,1)";
const HERO_SPOT_EASE = "cubic-bezier(0.14,1,0.22,1)";
/** Smooth in-out for continuous ambient motion (breath / rim). */
const HERO_AMBIENT_EASE = "cubic-bezier(0.45,0.05,0.55,0.95)";
/** Playback pulse on highlighted img. */
const HERO_PLAYBACK_EASE = "cubic-bezier(0.45,0,0.55,1)";
/** Shared shadow / opacity tween with layout. */
const HERO_SHADOW_EASE = "cubic-bezier(0.22,1,0.36,1)";

/** Stable pseudo-random light direction (0–359°) per collage slot each hero cycle. */
function heroSatLightAngleDeg(cycleIndex: number, slotIndex: number): number {
  const n = (cycleIndex * 197 + slotIndex * 293 + (slotIndex * slotIndex + 17) * cycleIndex) % 360;
  return n < 0 ? n + 360 : n;
}

function HeroCollageMotionStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@keyframes lightHeroPlayback{
  0%,100%{filter:brightness(1)saturate(1);transform:scale(1) translateZ(0)}
  38%{filter:brightness(1.1)saturate(1.08);transform:scale(1.03) translateZ(0)}
  62%{filter:brightness(1.04)saturate(1.12);transform:scale(1.016) translateZ(0)}
}
@keyframes lightHeroSpotFlip{
  0%,100%{transform:rotateY(-9deg) translateZ(0)}
  50%{transform:rotateY(9deg) translateZ(0)}
}
section[data-name="hero"] [data-hero-tile]{
  transform:translateZ(0);
  backface-visibility:hidden;
}
/* Satellites: no box-shadow transition — avoids fighting img transform breath + Tailwind shadow utilities. */
section[data-name="hero"] [data-hero-tile][data-hero-satellite="1"]{
  transition:left 800ms ${HERO_TILE_EASE},top 800ms ${HERO_TILE_EASE},width 800ms ${HERO_TILE_EASE},height 800ms ${HERO_TILE_EASE},border-radius 800ms ${HERO_TILE_EASE},
    opacity 640ms ${HERO_SHADOW_EASE},filter 640ms ${HERO_SHADOW_EASE},transform 680ms ${HERO_TILE_EASE},box-shadow 400ms ${HERO_SHADOW_EASE};
}
/* Spotlight: morph geometry + opacity; no outer glow (box-shadow / pseudo halos removed). */
section[data-name="hero"] [data-hero-tile][data-hero-spotlight-tile="1"]{
  transition:left 836ms ${HERO_SPOT_EASE},top 836ms ${HERO_SPOT_EASE},width 836ms ${HERO_SPOT_EASE},height 836ms ${HERO_SPOT_EASE},border-radius 836ms ${HERO_SPOT_EASE},
    opacity 380ms ${HERO_SHADOW_EASE},transform 740ms ${HERO_SPOT_EASE};
}
[data-light-hero-playback="1"]{
  animation:lightHeroPlayback ${HERO_PLAYBACK_ANIM_MS}ms ${HERO_PLAYBACK_EASE} infinite;
}
/* Default thumbnails: static light/shadow only; direction via --hero-sat-light-deg (set in JSX). */
section[data-name="hero"] [data-hero-satellite="1"]::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  z-index:1;
  background:linear-gradient(
    var(--hero-sat-light-deg,132deg),
    rgba(255,255,255,0.34) 0%,
    rgba(255,255,255,0.06) 22%,
    transparent 42%,
    rgba(0,0,0,0.16) 100%
  );
  mix-blend-mode:soft-light;
  opacity:0.88;
}
section[data-name="hero"] [data-hero-satellite="1"] video{
  z-index:0;
}
section[data-name="hero"] [data-hero-collage-root][data-hero-phase="spotlight"] [data-hero-satellite="1"]{
  transform:scale(0.96) translateZ(0);
  opacity:0.82;
  filter:saturate(0.86) brightness(0.96);
  box-shadow:0 5px 20px rgba(0,0,0,0.055);
  transition:left 800ms ${HERO_TILE_EASE},top 800ms ${HERO_TILE_EASE},width 800ms ${HERO_TILE_EASE},height 800ms ${HERO_TILE_EASE},border-radius 800ms ${HERO_TILE_EASE},
    transform 720ms ${HERO_TILE_EASE},opacity 720ms ${HERO_SHADOW_EASE},filter 720ms ${HERO_SHADOW_EASE},box-shadow 720ms ${HERO_SHADOW_EASE};
}
section[data-name="hero"] [data-hero-collage-root][data-hero-phase="idle"] [data-hero-satellite="1"]{
  transform:scale(1) translateZ(0);
  opacity:1;
  filter:none;
  transition:left 800ms ${HERO_TILE_EASE},top 800ms ${HERO_TILE_EASE},width 800ms ${HERO_TILE_EASE},height 800ms ${HERO_TILE_EASE},border-radius 800ms ${HERO_TILE_EASE},
    transform 720ms ${HERO_TILE_EASE},opacity 720ms ${HERO_SHADOW_EASE},filter 720ms ${HERO_SHADOW_EASE},box-shadow 400ms ${HERO_SHADOW_EASE};
}
section[data-name="hero"] [data-hero-spotlight-tile="1"]{
  position:absolute;
  isolation:isolate;
  perspective:980px;
  transform:scale(1) translateZ(0);
  opacity:1;
  box-shadow:none;
}
section[data-name="hero"] [data-hero-spotlight-tile="1"]::before,
section[data-name="hero"] [data-hero-spotlight-tile="1"]::after{
  content:none;
}
section[data-name="hero"] [data-hero-spot-flip]{
  transform-style:preserve-3d;
  animation:lightHeroSpotFlip 4.2s ${HERO_AMBIENT_EASE} infinite;
}
section[data-name="hero"] [data-hero-spotlight-tile="1"] video{
  position:relative;
  z-index:0;
  transform:translateZ(0);
  backface-visibility:hidden;
}
@media (prefers-reduced-motion:reduce){
  section[data-name="hero"] [data-hero-tile]{transition-duration:0.01ms!important}
  [data-light-hero-playback="1"]{animation:none!important}
  section[data-name="hero"] [data-hero-collage-root] [data-hero-satellite="1"]{
    transform:translateZ(0)!important;opacity:1!important;filter:none!important;animation:none!important;
  }
  section[data-name="hero"] [data-hero-satellite="1"] video,
  section[data-name="hero"] [data-hero-spotlight-tile="1"],
  section[data-name="hero"] [data-hero-spotlight-tile="1"]::before,
  section[data-name="hero"] [data-hero-spotlight-tile="1"]::after,
  section[data-name="hero"] [data-hero-spot-flip]{
    animation:none!important;
  }
  section[data-name="hero"] [data-hero-spot-flip]{transform:none!important}
}`,
      }}
    />
  );
}
/** System dark mode (Chrome / OS): `prefers-color-scheme` — colors only, layout unchanged. */
export function LightPrefersColorSchemeStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
html[data-mode="dark"] [data-light-page] {
    color-scheme: dark;
    color: #fafafa;
    background-color: #111114 !important;
  }
  html[data-mode="dark"] [data-light-page].bg-white,
  html[data-mode="dark"] [data-light-page] .bg-white {
    background-color: #111114 !important;
  }
  html[data-mode="dark"] [data-light-page] .text-black {
    color: #fafafa !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#1d1d1d\\] {
    color: #fafafa !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#111114\\] {
    color: #fafafa !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#666970\\] {
    color: #a1a1aa !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[rgba\\(29\\,29\\,29\\,0\\.6\\)\\] {
    color: rgba(255, 255, 255, 0.65) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[\\#111114\\] {
    background-color: #161616 !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(214\\,215\\,219\\,0\\.2\\)\\] {
    background-color: rgba(255, 255, 255, 0.06) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(214\\,215\\,219\\,0\\.4\\)\\] {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(217\\,217\\,217\\,0\\.5\\)\\] {
    background-color: rgba(255, 255, 255, 0.12) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(255\\,255\\,255\\,0\\.2\\)\\] {
    background-color: rgba(255, 255, 255, 0.08) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(255\\,255\\,255\\,0\\.8\\)\\] {
    background-color: rgba(26, 26, 26, 0.94) !important;
  }
  html[data-mode="dark"] [data-light-page] .border-\\[\\#d6d7db\\] {
    border-color: #262626 !important;
  }
  html[data-mode="dark"] [data-light-page] .border-white {
    border-color: #2a2a2a !important;
  }
  html[data-mode="dark"] [data-light-page] .border-\\[rgba\\(255\\,255\\,255\\,0\\.12\\)\\] {
    border-color: rgba(255, 255, 255, 0.14) !important;
  }
  html[data-mode="dark"] [data-light-page] .border-\\[rgba\\(255\\,255\\,255\\,0\\.2\\)\\] {
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  html[data-mode="dark"] [data-light-page] .to-white {
    --tw-gradient-to: #111114 !important;
  }
  html[data-mode="dark"] [data-light-page] path[fill="#111114"] {
    fill: #f4f4f5 !important;
  }
  html[data-mode="dark"] [data-light-page] [data-hero-prompt-dock] span.animate-pulse,
  html[data-mode="dark"] [data-light-page] [data-light-mobile-hero-prompt-input] span.animate-pulse {
    background-color: rgba(250, 250, 250, 0.9) !important;
  }
  html[data-mode="dark"] [data-light-page] section[data-name="hero"] [data-hero-satellite="1"]::before {
    background: linear-gradient(
      var(--hero-sat-light-deg, 132deg),
      rgba(255, 255, 255, 0.14) 0%,
      rgba(255, 255, 255, 0.04) 22%,
      transparent 42%,
      rgba(0, 0, 0, 0.48) 100%
    ) !important;
  }
  /* Hero prompt dock: rainbow rim + matching “+” control (dark / system). */
  html[data-mode="dark"] [data-light-page] [data-hero-prompt-dock] [data-light-prompt-card],
  html[data-mode="dark"] [data-light-page] [data-light-mobile-hero-prompt][data-light-prompt-card] {
    --light-prompt-rim: conic-gradient(
      from 210deg at 50% 50%,
      #34d399,
      #facc15,
      #fb7185,
      #22d3ee,
      #a78bfa,
      #34d399
    );
    background-color: transparent !important;
    background-image: linear-gradient(rgba(10, 10, 10, 0.97), rgba(10, 10, 10, 0.97)), var(--light-prompt-rim) !important;
    background-origin: border-box !important;
    background-clip: padding-box, border-box !important;
    border: 2px solid transparent !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
  }
  html[data-mode="dark"] [data-light-page] [data-hero-prompt-dock] [data-light-prompt-card] > div[aria-hidden="true"],
  html[data-mode="dark"] [data-light-page] [data-light-mobile-hero-prompt][data-light-prompt-card] > div[aria-hidden="true"] {
    opacity: 0 !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-prompt-plus].bg-white {
    background-color: transparent !important;
    background-image: linear-gradient(#080808, #080808), var(--light-prompt-rim) !important;
    background-origin: border-box !important;
    background-clip: padding-box, border-box !important;
    border: 2px solid transparent !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-prompt-plus] path {
    fill: #fafafa !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-default-style-icon] path {
    fill: #fafafa !important;
  }
  /* Marketing floors (Six Ways, Workflow, CTA, Footer gray band) */
  html[data-mode="dark"] [data-light-page] [data-light-floor].bg-\\[\\#f4f4f5\\] {
    background-color: rgba(255, 255, 255, 0.04) !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-floor] article.bg-\\[\\#f4f4f5\\] {
    background-color: #161616 !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-floor] .bg-white {
    background-color: #161616 !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#1d1d1d\\]\\/80 {
    color: rgba(250, 250, 250, 0.72) !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#1d1d1d\\]\\/70 {
    color: rgba(250, 250, 250, 0.72) !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#1d1d1d\\]\\/60 {
    color: rgba(255, 255, 255, 0.65) !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#1d1d1d\\]\\/50 {
    color: rgba(255, 255, 255, 0.55) !important;
  }
  html[data-mode="dark"] [data-light-page] .hover\\:text-\\[\\#1d1d1d\\]:hover {
    color: #fafafa !important;
  }
  html[data-mode="dark"] [data-light-page] .border-\\[\\#d6d7db\\]\\/80 {
    border-color: #262626 !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[\\#d6d7db\\]\\/80 {
    background-color: #262626 !important;
  }
  html[data-mode="dark"] [data-light-page] .shadow-\\[0px_2px_16px_0px_rgba\\(0\\,0\\,0\\,0\\.04\\)\\] {
    box-shadow: 0 2px 24px rgba(0, 0, 0, 0.45) !important;
  }
  html[data-mode="dark"] [data-light-page] .border-\\[rgba\\(36\\,102\\,255\\,0\\.2\\)\\] {
    border-color: rgba(36, 102, 255, 0.35) !important;
  }
  html[data-mode="dark"] [data-light-page] .border-\\[rgba\\(36\\,102\\,255\\,0\\.25\\)\\] {
    border-color: rgba(36, 102, 255, 0.4) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(36\\,102\\,255\\,0\\.08\\)\\] {
    background-color: rgba(36, 102, 255, 0.14) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(36\\,102\\,255\\,0\\.12\\)\\] {
    background-color: rgba(36, 102, 255, 0.18) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(36\\,102\\,255\\,0\\.2\\)\\] {
    background-color: rgba(36, 102, 255, 0.28) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(36\\,102\\,255\\,0\\.28\\)\\] {
    background-color: rgba(36, 102, 255, 0.32) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(36\\,102\\,255\\,0\\.35\\)\\] {
    background-color: rgba(36, 102, 255, 0.42) !important;
  }
  html[data-mode="dark"] [data-light-page] .bg-\\[rgba\\(36\\,102\\,255\\,0\\.45\\)\\] {
    background-color: rgba(36, 102, 255, 0.5) !important;
  }
  html[data-mode="dark"] [data-light-page] .text-\\[\\#2466FF\\]\\/50 {
    color: rgba(36, 102, 255, 0.6) !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-floor-icon] rect {
    fill: #161616 !important;
    stroke: #3f3f46 !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-floor-icon] path {
    stroke: #e4e4e7 !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-card-dots] {
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1px) !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-bar-chart] > div {
    background: linear-gradient(
      180deg,
      rgba(36, 102, 255, 0.62) 0%,
      rgba(36, 102, 255, 0.16) 70%,
      rgba(36, 102, 255, 0) 100%
    ) !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-workflow-graphic] [fill="#E9F0FF"] {
    fill: rgba(36, 102, 255, 0.14) !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-workflow-graphic] [fill="white"] {
    fill: rgba(255, 255, 255, 0.12) !important;
  }
  html[data-mode="dark"] [data-light-page] [data-light-workflow-graphic] [fill="#D6D7DB"] {
    fill: #3f3f46 !important;
  }`,
      }}
    />
  );
}

function Group() {
  return (
    <div className="inline-flex items-center rounded-[999px] bg-[rgba(217,217,217,0.5)] px-[18px] py-[7px] w-[252px]">
      <p className="whitespace-nowrap font-['Poppins:Regular',sans-serif] text-[12px] font-medium uppercase leading-normal tracking-[0.08em] text-[#1d1d1d] opacity-80">
        THE ONE-PERSON VIDEO STUDIO
      </p>
    </div>
  );
}

function Group1() {
  return (
    <MarketingAuthLink
      className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1 no-underline"
      desktopDisplayClassName="hidden min-[768px]:inline-grid"
      mobileDisplayClassName="inline-grid min-[768px]:hidden"
      showAvatarWhenAuthenticated
    >
      <div className="bg-[#2466ff] col-1 h-[40px] ml-0 mt-0 rounded-[30px] row-1 w-[100px]" />
      <div className="capitalize col-1 flex flex-col font-['Poppins:Medium',sans-serif] h-[19px] justify-center ml-[15px] mt-[10px] not-italic relative row-1 text-[16px] text-center text-white w-[69px]">
        <p className="leading-[normal]">Sign In</p>
      </div>
    </MarketingAuthLink>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Group1 />
    </div>
  );
}

function Logo() {
  return (
    <header
      className="absolute inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between py-[30px] pl-[var(--light-gutter)] pr-[52px]"
      data-hero-chrome=""
      data-name="带字logo"
    >
      <a
        aria-label="VizNow home"
        className="flex min-w-0 shrink-0 cursor-pointer items-center no-underline"
        href="/"
      >
        <VizNowAiLogo />
      </a>
      <div className="flex min-w-0 shrink-0">
        <Group2 />
      </div>
    </header>
  );
}
function Frame51() {
  return (
    <div className="bg-[rgba(255,255,255,0.8)] h-[165px] relative rounded-[20px] shrink-0 w-full">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex items-start justify-center px-[16px] py-[12px] relative size-full">
          <p className="flex-[1_0_0] font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[1.5] min-h-px min-w-px relative text-[25px] text-black">
            {HERO_CYCLE_PROMPTS[0]}
          </p>
        </div>
      </div>
    </div>
  );
}

function Home1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="home">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="home">
          <path d={svgPaths.p2191fa00} fill="var(--fill-0, black)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Component1() {
  return (
    <div
      className="bg-white content-stretch flex flex-col items-center justify-center overflow-clip p-[2px] relative rounded-[15px] shrink-0 size-[28px]"
      data-light-prompt-plus=""
      data-name="+"
    >
      <Home1 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="relative shrink-0 size-[20px]" data-light-default-style-icon="">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Frame 2147225326">
          <g id="Union">
            <path clipRule="evenodd" d={svgPaths.p1a73100} fill="var(--fill-0, #111114)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3166dc00} fill="var(--fill-0, #111114)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <MarketingAuthLink
      className="bg-[#2466ff] content-stretch flex gap-[6px] h-[36px] items-center justify-center px-[16px] relative rounded-[39px] shrink-0 no-underline"
    >
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[15px] text-center text-white whitespace-nowrap">Get Start for Free</p>
    </MarketingAuthLink>
  );
}

function Frame52() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="bg-white content-stretch flex gap-[4px] h-[36px] items-center pl-[12px] pr-[10px] relative rounded-[100px] shrink-0">
        <Frame30 />
        <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#111114] text-[14px] whitespace-nowrap">Default style</p>
      </div>
      <Frame11 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[16px] relative w-full">
          <Component1 />
          <Frame52 />
        </div>
      </div>
    </div>
  );
}

/** Top-left mapping chip: cycle vs prompt row vs collage video key (for hero preview QA). */
function HeroCycleMapPreview({
  cycleIndex,
  slideIndex,
  promptCount,
  videoKey,
  className,
  style,
}: {
  cycleIndex: number;
  slideIndex: number;
  promptCount: number;
  videoKey: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`pointer-events-none select-none whitespace-nowrap rounded-md bg-[rgba(0,0,0,0.72)] px-2 py-1 font-mono text-[11px] leading-tight text-white/95 tabular-nums shadow-sm backdrop-blur-sm ${className ?? ""}`}
      data-hero-preview-map=""
      aria-hidden
      style={style}
    >
      #{cycleIndex} · P{slideIndex + 1}/{promptCount} · {videoKey}
    </div>
  );
}

function Frame42({ promptSlot }: { promptSlot?: React.ReactNode } = {}) {
  return (
    <div
      className="relative mx-auto flex w-[min(770px,calc(100%-160px))] max-w-[calc(100%-32px)] flex-col content-stretch items-start gap-[16px] rounded-[24px] bg-[rgba(214,215,219,0.4)] p-[12px] shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-[20px]"
      data-light-prompt-card=""
    >
      <MarketingAuthLink
        aria-label="Start creating with VizNow"
        className="absolute inset-0 z-[5] rounded-[24px] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#2466ff] focus-visible:ring-offset-2"
        data-light-hero-prompt-click-target=""
      >
        <span className="sr-only">Start creating with VizNow</span>
      </MarketingAuthLink>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[25px]" />
      <div className="relative z-[2] flex w-full flex-col content-stretch items-start gap-[16px] pointer-events-none">
        {promptSlot ?? <Frame51 />}
        <Frame12 />
      </div>
    </div>
  );
}

const MOBILE_HERO_SPOTLIGHT_BOX: HeroRestRect = {
  left: 74,
  top: 14,
  w: 236,
  h: heroHeightFromWidth(236),
  r: 18,
  z: 40,
};

const MOBILE_HERO_SATELLITE_BOXES: readonly HeroRestRect[] = [
  { left: 8, top: 46, w: 116, h: heroHeightFromWidth(116), r: 14, z: 14 },
  { left: 266, top: 40, w: 118, h: heroHeightFromWidth(118), r: 14, z: 13 },
  { left: 24, top: 154, w: 138, h: heroHeightFromWidth(138), r: 15, z: 16 },
  { left: 224, top: 158, w: 140, h: heroHeightFromWidth(140), r: 15, z: 15 },
];

function mobileHeroTileBox(index: number, activeThumbIndex: number): HeroRestRect {
  if (index === activeThumbIndex) return MOBILE_HERO_SPOTLIGHT_BOX;
  let satelliteSlot = 0;
  for (let offset = 1; offset < HERO_COLLAGE_VIDEOS.length; offset += 1) {
    if ((activeThumbIndex + offset) % HERO_COLLAGE_VIDEOS.length === index) {
      satelliteSlot = offset - 1;
      break;
    }
  }
  return MOBILE_HERO_SATELLITE_BOXES[satelliteSlot] ?? MOBILE_HERO_SATELLITE_BOXES[0]!;
}

function MobileHeroMotionStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@keyframes lightMobileHeroFloat{
  0%,100%{transform:translateX(-50%) translate3d(0,0,0) rotateX(42deg) rotateZ(-6deg)}
  50%{transform:translateX(-50%) translate3d(0,-8px,0) rotateX(42deg) rotateZ(-4.8deg)}
}
@keyframes lightMobileHeroCollageDrift{
  0%,100%{transform:translate3d(0,0,0)}
  50%{transform:translate3d(0,-7px,0)}
}
@keyframes lightMobileHeroPlayback{
  0%,100%{filter:brightness(1)saturate(1);transform:scale(1) translateZ(0)}
  38%{filter:brightness(1.1)saturate(1.08);transform:scale(1.025) translateZ(0)}
  62%{filter:brightness(1.04)saturate(1.12);transform:scale(1.012) translateZ(0)}
}
@keyframes lightMobileHeroCursor{
  0%,48%{opacity:1}
  49%,100%{opacity:0}
}
@keyframes lightMobileHeroButtonSweep{
  0%,8%{left:-58px;opacity:0}
  14%{opacity:1}
  26%{left:330px;opacity:0}
  34%{left:-58px;opacity:0}
  40%{opacity:1}
  52%{left:330px;opacity:0}
  53%,100%{left:330px;opacity:0}
}
[data-light-mobile-hero-ambient]{
  animation:lightMobileHeroFloat 6.4s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
}
[data-light-mobile-hero-stage] [data-hero-collage-root]{
  animation:lightMobileHeroCollageDrift 7.2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
}
[data-light-mobile-hero-stage] [data-hero-tile]{
  transform:translateZ(0);
  backface-visibility:hidden;
}
[data-light-mobile-hero-stage] [data-hero-tile][data-hero-satellite="1"]{
  transition:left 800ms ${HERO_TILE_EASE},top 800ms ${HERO_TILE_EASE},width 800ms ${HERO_TILE_EASE},height 800ms ${HERO_TILE_EASE},border-radius 800ms ${HERO_TILE_EASE},
    opacity 720ms ${HERO_SHADOW_EASE},filter 720ms ${HERO_SHADOW_EASE},transform 720ms ${HERO_TILE_EASE},box-shadow 720ms ${HERO_SHADOW_EASE};
  transform:scale(.96) translateZ(0);
  opacity:.82;
  filter:saturate(.88) brightness(.96);
  box-shadow:0 18px 50px rgba(0,0,0,.38);
}
[data-light-mobile-hero-stage] [data-hero-tile][data-hero-satellite="1"]::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:1;
  border-radius:inherit;
  pointer-events:none;
  background:linear-gradient(
    var(--hero-sat-light-deg,132deg),
    rgba(255,255,255,.32) 0%,
    rgba(255,255,255,.08) 23%,
    transparent 43%,
    rgba(0,0,0,.24) 100%
  );
  mix-blend-mode:soft-light;
}
[data-light-mobile-hero-stage] [data-hero-tile][data-hero-spotlight-tile="1"]{
  transition:left 836ms ${HERO_SPOT_EASE},top 836ms ${HERO_SPOT_EASE},width 836ms ${HERO_SPOT_EASE},height 836ms ${HERO_SPOT_EASE},border-radius 836ms ${HERO_SPOT_EASE},
    opacity 420ms ${HERO_SHADOW_EASE},transform 740ms ${HERO_SPOT_EASE},box-shadow 740ms ${HERO_SHADOW_EASE};
  transform:scale(1) translateZ(0);
  opacity:1;
  box-shadow:none;
}
[data-light-mobile-hero-stage] [data-hero-tile][data-hero-spotlight-tile="1"]::after{
  content:"";
  position:absolute;
  inset:0;
  z-index:2;
  border-radius:inherit;
  pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.2));
}
[data-light-mobile-hero-stage] [data-light-mobile-hero-playback="1"]{
  animation:lightMobileHeroPlayback ${HERO_PLAYBACK_ANIM_MS}ms ${HERO_PLAYBACK_EASE} infinite;
}
[data-light-mobile-hero-typing-cursor]{
  animation:lightMobileHeroCursor 1s steps(2,start) infinite;
}
[data-light-mobile-hero-cta]::before{
  content:"";
  position:absolute;
  top:-38%;
  bottom:-38%;
  width:46px;
  left:-58px;
  transform:rotate(22deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.76),transparent);
  animation:lightMobileHeroButtonSweep 8s ease-in-out infinite;
}
@media (prefers-reduced-motion:reduce){
  [data-light-mobile-hero-ambient],
  [data-light-mobile-hero-stage] [data-hero-collage-root],
  [data-light-mobile-hero-stage] [data-light-mobile-hero-playback="1"],
  [data-light-mobile-hero-typing-cursor],
  [data-light-mobile-hero-cta]::before{animation:none!important}
  [data-light-mobile-hero-stage] [data-hero-tile]{transition-duration:.01ms!important}
}`,
      }}
    />
  );
}

export function MobileHeroSection() {
  const mobileInitialIndex = 3;
  const mobileHeroSectionRef = useRef<HTMLElement | null>(null);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(mobileInitialIndex);
  const activeSlideIndex = activeIndex % HERO_CYCLE_PROMPTS.length;
  const activeThumbIndex = activeIndex % HERO_COLLAGE_VIDEOS.length;
  const activePrompt = HERO_CYCLE_PROMPTS[activeSlideIndex] ?? HERO_CYCLE_PROMPTS[0];
  const mobileCycleTotalMs = HERO_CYCLE_TOTAL_MS_BY_SLIDE[activeSlideIndex] ?? HERO_CYCLE_TOTAL_MS_BY_SLIDE[0];
  const [mobileHeroEnabled, setMobileHeroEnabled] = useState(false);
  const [mobileHeroInViewport, setMobileHeroInViewport] = useState(true);
  const [mobileDocumentVisible, setMobileDocumentVisible] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.visibilityState === "visible";
  });
  const [mobileReduceMotion, setMobileReduceMotion] = useState(false);
  const [typedLen, setTypedLen] = useState(activePrompt.length);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileHeroRunning = mobileHeroEnabled && mobileHeroInViewport && mobileDocumentVisible && !mobileReduceMotion;
  const mobileLightNavLinks = [
    { label: "Features", href: "#main-content" },
    { label: "Examples", href: "#light-heading-cases" },
    { label: "Community", href: "#light-heading-social-proof" },
  ] as const;
  const mobileLightMenuPanelTopClass = "top-[88px]";
  const mobileLightMenuScrimTopClass = "top-[240px]";
  // Figma opens this menu with Features visually highlighted as the default first stop.
  const mobileLightDefaultHighlightedNavIndex = 0;
  const mobileLightNavLinkBaseClass =
    "flex h-[44px] items-center rounded-[10px] px-3 font-['Poppins:Regular',sans-serif] text-[17px] text-[#111114] no-underline";
  const mobileLightNavLinkHighlightedClass = "bg-[#f4f4f5]";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const sync = () => setMobileHeroEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMobileReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const sync = () => setMobileDocumentVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    const root = mobileHeroSectionRef.current;
    if (!mobileHeroEnabled || !root || typeof IntersectionObserver === "undefined") {
      setMobileHeroInViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setMobileHeroInViewport(Boolean(entry?.isIntersecting));
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [mobileHeroEnabled]);

  useEffect(() => {
    if (typeof window === "undefined" || !mobileHeroEnabled) {
      setTypedLen(activePrompt.length);
      return;
    }
    if (mobileReduceMotion) {
      setTypedLen(activePrompt.length);
      return;
    }
    if (!mobileHeroRunning) return;

    let disposed = false;
    const timerIds: number[] = [];
    const runAfter = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (disposed) return;
        fn();
      }, ms);
      timerIds.push(id);
    };

    setTypedLen(0);
    const n = activePrompt.length;
    for (let i = 1; i <= n; i += 1) {
      runAfter(Math.round((HERO_TYPING_MS * i) / n), () => setTypedLen(i));
    }
    runAfter(mobileCycleTotalMs + HERO_POST_PLAY_MS, () => setActiveIndex((i) => i + 1));

    return () => {
      disposed = true;
      timerIds.forEach((id) => window.clearTimeout(id));
    };
  }, [activePrompt, mobileCycleTotalMs, mobileHeroEnabled, mobileHeroRunning, mobileReduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined" || !mobileHeroRunning) {
      mobileVideoRefs.current.forEach((el) => {
        if (el) el.pause();
      });
      return;
    }
    mobileVideoRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === activeThumbIndex;
      if (!isActive) {
        el.pause();
        const freezeAt = HERO_FREEZE_SEC_BY_SLIDE[i] ?? 0;
        try {
          el.currentTime = freezeAt;
        } catch {
          /* metadata may still be loading; the active transition will retry. */
        }
      } else {
        try {
          el.currentTime = 0;
        } catch {
          /* metadata may still be loading; play() still starts from the available frame. */
        }
        void el.play().catch(() => {});
      }
    });
  }, [activeThumbIndex, mobileHeroRunning]);

  const displayedPrompt = activePrompt.slice(0, typedLen);
  const showMobileCaret = typedLen < activePrompt.length;

  return (
    <section
      ref={mobileHeroSectionRef}
      className="relative box-border flex min-h-[max(100dvh,860px)] w-full flex-col overflow-hidden bg-white px-5 pb-8 pt-5 text-[#1d1d1d] min-[390px]:min-h-[max(100dvh,884px)]"
      data-light-hero-mobile=""
      data-name="mobile-hero"
    >
      <MobileHeroMotionStyles />
      <div
        className="pointer-events-none absolute inset-0 bg-white"
        aria-hidden
      />
      <header className="relative z-30 mx-auto flex h-[48px] w-full max-w-[430px] items-center justify-between">
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          aria-expanded={mobileMenuOpen}
          className="inline-flex h-[44px] w-[44px] appearance-none items-center justify-start border-0 bg-transparent p-0 text-[#111114] shadow-none outline-none focus:outline-none focus-visible:outline-none"
          data-light-mobile-menu-button=""
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={2} />
        </button>
        <a
          aria-label="VizNow home"
          className="absolute left-1/2 top-1/2 flex min-w-0 cursor-pointer items-center no-underline"
          href="/"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <VizNowAiLogo className="origin-center scale-[0.9]" />
        </a>
        <MarketingAuthLink
          className="inline-flex h-[38px] w-[78px] shrink-0 items-center justify-center rounded-[30px] bg-[#2466ff] px-0 font-['Poppins:Medium',sans-serif] text-[15px] text-white no-underline shadow-none"
          showAvatarWhenAuthenticated
        >
          Sign In
        </MarketingAuthLink>
      </header>
      {mobileMenuOpen ? (
        <>
          <nav
            aria-label="Mobile website navigation"
            className={`absolute inset-x-0 ${mobileLightMenuPanelTopClass} z-20 bg-[#F7F7F8] px-4 pb-5 pt-2`}
            data-light-mobile-menu-panel=""
          >
            <div className="mx-auto flex w-full max-w-[430px] flex-col gap-1">
              {mobileLightNavLinks.map((item, index) => (
                <a
                  key={item.href}
                  className={
                    index === mobileLightDefaultHighlightedNavIndex
                      ? `${mobileLightNavLinkBaseClass} ${mobileLightNavLinkHighlightedClass}`
                      : mobileLightNavLinkBaseClass
                  }
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
          <button
            type="button"
            aria-label="Close mobile menu overlay"
            className={`absolute inset-x-0 bottom-0 ${mobileLightMenuScrimTopClass} z-[9] border-0 bg-[rgba(17,17,20,0.46)] p-0`}
            data-light-mobile-menu-scrim=""
            onClick={() => setMobileMenuOpen(false)}
          />
        </>
      ) : null}

      <div className="relative z-[2] mx-auto flex w-full max-w-[430px] flex-1 flex-col pt-[46px] text-center">
        <div className="mx-auto inline-flex w-fit max-w-full items-center rounded-[999px] bg-[rgba(217,217,217,0.5)] px-4 py-[7px]">
          <p className="m-0 whitespace-nowrap font-['Poppins:Regular',sans-serif] text-[11px] font-medium uppercase leading-normal tracking-[0.08em] text-[#1d1d1d]/80">
            THE ONE-PERSON VIDEO STUDIO
          </p>
        </div>
        <h1 className="m-0 mx-auto mt-[18px] max-w-[350px] font-['Questrial:Regular',sans-serif] text-[38px] font-normal leading-[1.02] text-[#1d1d1d] min-[390px]:text-[40px]">
          Great Thinking Deserves Great Visual Storytelling.
        </h1>
        <p className="m-0 mx-auto mt-3 max-w-[310px] font-['Poppins:Regular',sans-serif] text-[13px] leading-[1.45] text-[rgba(29,29,29,0.6)]">
          Turn ideas, scripts, and trends into studio-grade visual narratives.
        </p>
      </div>

      <div className="absolute inset-x-0 top-[327px] z-[3] mx-auto w-full max-w-[430px] px-5 min-[390px]:top-[337px]">
        <div
          className="relative mx-auto flex h-[204px] w-full flex-col content-stretch items-start gap-[16px] rounded-[24px] bg-[rgba(214,215,219,0.4)] p-[12px] shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-[20px]"
          data-light-mobile-hero-prompt=""
          data-light-prompt-card=""
        >
          <MarketingAuthLink
            aria-label="Start creating with VizNow"
            className="absolute inset-0 z-[5] rounded-[24px] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#2466ff] focus-visible:ring-offset-2"
            data-light-mobile-hero-prompt-click-target=""
          >
            <span className="sr-only">Start creating with VizNow</span>
          </MarketingAuthLink>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[25px]" />
          <div className="relative h-[126px] w-full shrink-0 rounded-[20px] bg-[rgba(255,255,255,0.8)]" data-light-mobile-hero-prompt-input="">
            <div className="flex size-full flex-row justify-center">
              <div className="relative flex size-full content-stretch items-start justify-center px-[16px] py-[12px]">
                <p
                  className="relative max-h-full min-h-px min-w-px flex-[1_0_0] overflow-hidden text-left font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[14px] font-medium leading-[1.45] text-black"
                >
                  {displayedPrompt}
                  {showMobileCaret ? (
                    <span
                      aria-hidden
                      className="ml-[2px] inline-block h-[1.08em] w-[2px] translate-y-[0.06em] animate-pulse bg-[#111114]/85 align-middle [animation-duration:1.778s]"
                      data-light-mobile-hero-typing-cursor=""
                    />
                  ) : null}
                </p>
              </div>
            </div>
          </div>
          <div className="relative flex h-[38px] w-full shrink-0 items-center justify-center" data-light-mobile-hero-prompt-actions="">
            <MarketingAuthLink
              className="relative inline-flex h-[38px] w-[220px] items-center justify-center overflow-hidden rounded-[999px] bg-[linear-gradient(135deg,#2f6bff,#1d4ed8_48%,#22d3ee)] font-['Poppins:Medium',sans-serif] text-[12px] font-semibold text-white no-underline shadow-[0_14px_38px_rgba(37,99,235,0.45),inset_0_1px_0_rgba(255,255,255,0.28)]"
              data-light-mobile-hero-cta=""
            >
              <span className="relative z-[1]">Get Start for free</span>
            </MarketingAuthLink>
          </div>
        </div>
      </div>

      <div
        data-light-mobile-hero-stage=""
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[553px] z-[1] overflow-visible bg-white min-[390px]:top-[561px]"
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-[-12px] z-[1] h-[12px] bg-white"
          data-light-mobile-hero-stage-seam=""
          aria-hidden
        />
        <div
          className="absolute top-2 z-[2] h-[246px] w-[384px]"
          style={{ left: "calc(50% - 192px)" }}
        >
          <div
            className="relative size-full"
            data-hero-collage-root=""
            data-hero-phase="spotlight"
          >
            {HERO_COLLAGE_VIDEOS.map((item, i) => {
              const isActive = i === activeThumbIndex;
              const shouldPlayVideo = isActive && mobileHeroRunning;
              const box = mobileHeroTileBox(i, activeThumbIndex);
              return (
                <div
                  key={item.key}
                  className="absolute overflow-hidden bg-[#111827]"
                  data-hero-satellite={isActive ? undefined : "1"}
                  data-hero-spotlight-tile={isActive ? "1" : undefined}
                  data-hero-tile=""
                  style={{
                    left: box.left,
                    top: box.top,
                    width: box.w,
                    height: box.h,
                    borderRadius: box.r,
                    zIndex: box.z ?? 12,
                    ...({
                      "--hero-sat-light-deg": `${heroSatLightAngleDeg(activeIndex, i)}deg`,
                    } as React.CSSProperties),
                  }}
                >
                  {shouldPlayVideo ? (
                    <video
                      ref={(el) => {
                        mobileVideoRefs.current[i] = el;
                      }}
                      aria-hidden
                      autoPlay
                      className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[inherit] object-cover"
                      data-light-mobile-hero-active-video=""
                      data-light-mobile-hero-playback="1"
                      muted
                      playsInline
                      poster={item.mobilePosterSrc}
                      preload="auto"
                      src={item.src}
                      onEnded={(e) => {
                        const el = e.currentTarget;
                        el.pause();
                        const freezeAt = HERO_FREEZE_SEC_BY_SLIDE[i] ?? 0;
                        try {
                          el.currentTime = freezeAt;
                        } catch {
                          /* ignored — next active transition will reset. */
                        }
                      }}
                    />
                  ) : (
                    <img
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[inherit] object-cover"
                      data-light-mobile-hero-poster=""
                      decoding="async"
                      loading={isActive ? "eager" : "lazy"}
                      src={item.mobilePosterSrc}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSection({ staticExport = false }: { staticExport?: boolean }) {
  const promptCount = HERO_CYCLE_PROMPTS.length;
  const collageCount = HERO_COLLAGE_VIDEOS.length;
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const heroSectionRef = useRef<HTMLElement | null>(null);

  /** When false, hero prompt/collage timers are cleared and videos paused — avoids cycling decode while scrolled away. */
  const [heroInViewport, setHeroInViewport] = useState(true);

  const [cycleIndex, setCycleIndex] = useState(0);
  /** Match `renderToStaticMarkup` when hydrating public/index.html (`staticExport`). SPA keeps empty-then-typewriter. */
  const [typedLen, setTypedLen] = useState(() => {
    if (staticExport) return HERO_CYCLE_PROMPTS[0].length;
    if (typeof document === "undefined") return HERO_CYCLE_PROMPTS[0].length;
    return 0;
  });
  const [desktopHeroEnabled, setDesktopHeroEnabled] = useState(false);
  const [atSpotlight, setAtSpotlight] = useState(false);
  const [playback, setPlayback] = useState(false);
  const [heroRestRects, setHeroRestRects] = useState<HeroRestRect[]>(() => heroSsgRestLayout());

  const slideIndex = cycleIndex % promptCount;
  const activeThumbIndex = cycleIndex % collageCount;
  const currentPrompt = HERO_CYCLE_PROMPTS[slideIndex];
  const displayedPrompt = currentPrompt.slice(0, typedLen);
  const showCaret = typedLen < currentPrompt.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktopHeroEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = heroSectionRef.current;
    if (!desktopHeroEnabled || !root || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setHeroInViewport(entry.isIntersecting);
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    obs.observe(root);
    return () => obs.disconnect();
  }, [desktopHeroEnabled]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!desktopHeroEnabled) {
      setPlayback(false);
      setAtSpotlight(false);
      heroVideoRefs.current.forEach((el) => {
        if (!el) return;
        el.pause();
      });
      return;
    }
    if (!heroInViewport) {
      setPlayback(false);
      setAtSpotlight(false);
      heroVideoRefs.current.forEach((el) => {
        if (!el) return;
        el.pause();
      });
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slide = cycleIndex % promptCount;
    const prompt = HERO_CYCLE_PROMPTS[slide];
    const cycleTotalMs = HERO_CYCLE_TOTAL_MS_BY_SLIDE[slide] ?? HERO_CYCLE_TOTAL_MS_BY_SLIDE[0];
    if (reduce) {
      setTypedLen(prompt.length);
      setAtSpotlight(false);
      setPlayback(false);
      setHeroRestRects(heroSsgRestLayout());
      return;
    }

    let disposed = false;
    const timerIds: number[] = [];

    setHeroRestRects(heroPickRandomRestLayout());
    setAtSpotlight(true);
    setPlayback(true);
    setTypedLen(0);

    const runAfter = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (disposed) return;
        fn();
      }, ms);
      timerIds.push(id);
    };

    const n = prompt.length;
    if (n > 0) {
      for (let i = 1; i <= n; i += 1) {
        const tChar = Math.round((HERO_TYPING_MS * i) / n);
        const shown = i;
        runAfter(tChar, () => setTypedLen(shown));
      }
    }

    runAfter(cycleTotalMs, () => {
      setPlayback(false);
      setAtSpotlight(false);
    });
    runAfter(cycleTotalMs + HERO_POST_PLAY_MS, () => {
      setCycleIndex((c) => c + 1);
    });

    return () => {
      disposed = true;
      timerIds.forEach((id) => window.clearTimeout(id));
    };
  }, [cycleIndex, promptCount, heroInViewport, desktopHeroEnabled]);

  useEffect(() => {
    if (typeof document === "undefined" || !desktopHeroEnabled || !heroInViewport) {
      heroVideoRefs.current.forEach((el) => {
        if (el) el.pause();
      });
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heroVideoRefs.current.forEach((el, i) => {
      if (!el) return;
      const inSpotlight = i === activeThumbIndex && atSpotlight;
      if (reduce || !inSpotlight) {
        el.pause();
        const freezeAt = HERO_FREEZE_SEC_BY_SLIDE[i] ?? 0;
        try {
          el.currentTime = freezeAt;
        } catch {
          /* readyState too early — `loadedmetadata` will snap to freezeAt below */
        }
      } else {
        try {
          el.currentTime = 0;
        } catch {
          /* same as above; play() below still kicks off from the available start */
        }
        void el.play().catch(() => {});
      }
    });
  }, [activeThumbIndex, atSpotlight, heroInViewport, desktopHeroEnabled]);

  return (
    <section
      ref={heroSectionRef}
      className="relative box-border flex h-[clamp(var(--light-hero-min-h),100dvh,var(--light-hero-max-h))] min-h-0 w-full flex-col overflow-hidden"
      data-light-hero-desktop=""
      data-name="hero"
    >
      <HeroCollageMotionStyles />
      <div
        className="absolute inset-0 z-0"
        data-hero-collage-root=""
        data-hero-phase={atSpotlight ? "spotlight" : "idle"}
        data-light-hero-zoom="collage"
      >
        {HERO_COLLAGE_VIDEOS.map((item, i) => {
          const isActive = i === activeThumbIndex;
          const toSpot = isActive && atSpotlight;
          const rest = heroRestRects[i] ?? heroSsgRestLayout()[i]!;
          const boxStyle: React.CSSProperties = toSpot
            ? { ...HERO_SPOTLIGHT_STYLE, zIndex: 40 }
            : {
                left: rest.left,
                top: rest.top,
                width: rest.w,
                height: rest.h,
                borderRadius: rest.r,
                zIndex: rest.z ?? 12,
                ...({
                  "--hero-sat-light-deg": `${heroSatLightAngleDeg(cycleIndex, i)}deg`,
                } as React.CSSProperties),
              };
          return (
            <div
              key={item.key}
              className={`absolute overflow-hidden ${
                toSpot
                  ? "pointer-events-none"
                  : "pointer-events-auto cursor-pointer shadow-[0_10px_32px_rgba(0,0,0,0.09)] hover:z-[30] hover:shadow-[0_18px_44px_rgba(0,0,0,0.12)] hover:ring-1 hover:ring-[#2466ff]/28"
              }`}
              data-hero-spotlight-tile={toSpot ? "1" : undefined}
              data-hero-satellite={toSpot ? undefined : "1"}
              data-hero-tile=""
              style={boxStyle}
            >
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
                data-hero-spot-flip={toSpot ? "" : undefined}
              >
                <video
                  ref={(el) => {
                    heroVideoRefs.current[i] = el;
                    if (el) {
                      el.setAttribute("fetchpriority", "high");
                    }
                  }}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 max-w-none size-full rounded-[inherit] object-cover"
                  data-light-hero-playback={toSpot && playback ? "1" : undefined}
                  src={desktopHeroEnabled ? item.src : undefined}
                  muted
                  playsInline
                  preload={desktopHeroEnabled ? "auto" : "none"}
                  onEnded={(e) => {
                    const el = e.currentTarget;
                    el.pause();
                    const freezeAt = HERO_FREEZE_SEC_BY_SLIDE[i] ?? 0;
                    try {
                      el.currentTime = freezeAt;
                    } catch {
                      /* ignored — next spotlight enter will reset */
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <Logo />
      <div
        className="relative z-[2] flex min-h-0 max-w-[46%] flex-1 flex-col overflow-hidden px-[var(--light-gutter)] pt-[150px] min-[1441px]:max-w-[52%]"
        data-hero-doc=""
        data-light-hero-zoom="doc"
      >
        <Group />
        <h1
          className="mt-[36px] m-0 flex w-full max-w-full flex-col text-left font-normal font-['Questrial:Regular',sans-serif] not-italic leading-[1.07] text-[#1d1d1d] whitespace-pre-wrap"
          data-hero-headline=""
        >
          <span className="mb-0 block">Great Thinking Deserves Great Visual Storytelling.</span>
        </h1>
        <div className="mt-[32px] w-full max-w-full text-left font-['Poppins:Regular',sans-serif] text-[16px] leading-[1.5] not-italic text-[#1d1d1d] opacity-60 whitespace-pre-wrap">
          <p className="mb-0">
            {`An end-to-end AI video studio that turns trending topics into studio-grade visual narratives at scale—no production team required.`}
          </p>
        </div>
      </div>
      <div data-hero-prompt-dock="" data-light-hero-zoom="dock">
        <Frame42
          promptSlot={
            <div className="relative h-[150px] w-full shrink-0 rounded-[20px] bg-[rgba(255,255,255,0.8)]">
              {HERO_SHOW_PROMPT_MAP_PREVIEW ? (
                <HeroCycleMapPreview
                  className="absolute left-3 top-3 z-10"
                  cycleIndex={cycleIndex}
                  slideIndex={slideIndex}
                  promptCount={promptCount}
                  videoKey={HERO_COLLAGE_VIDEOS[activeThumbIndex]?.key ?? "?"}
                />
              ) : null}
              <div className="flex size-full flex-row justify-center">
                <div className="relative flex size-full content-stretch items-start justify-center px-[16px] py-[12px]">
                  <p className="relative min-h-px min-w-px flex-[1_0_0] text-left font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[25px] font-medium leading-[1.5] text-black">
                    {displayedPrompt}
                    {showCaret ? (
                      <span
                        aria-hidden
                        className="ml-[2px] inline-block h-[1.08em] w-[2px] translate-y-[0.06em] animate-pulse bg-[#111114]/85 align-middle [animation-duration:1.778s]"
                      />
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

export type LightProps = { staticExport?: boolean };

export default function Light({ staticExport = false }: LightProps) {
  return (
    <main
      id="main-content"
      data-light-page
      className="relative mx-auto flex w-full min-w-0 max-w-[1440px] min-h-0 flex-col bg-[var(--viznow-canvas-bg,#ffffff)] [--light-gutter:20px] min-[1024px]:[--light-gutter:80px] min-[1200px]:min-w-[1400px]"
      data-name="light"
    >
      <LightPrefersColorSchemeStyles />
      <HeroSection staticExport={staticExport} />
      <MobileHeroSection />
      <Suspense fallback={<div className="min-h-[400px] w-full shrink-0" aria-hidden />}>
        <LightBelowFoldLazy />
      </Suspense>
      <LightMobilePcStudioDialog />
    </main>
  );
}
