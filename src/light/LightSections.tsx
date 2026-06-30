import React, { useCallback, useEffect, useRef, useState } from "react";
import { APP_SIGN_IN_URL } from "@/lib/links";
import { cn } from "@/lib/utils";
import { LightMarketingFooter } from "./LightMarketingFooter";
import { LightSixWaysSection } from "./LightSixWaysSection";
import { LightStudioWorkflowSection } from "./LightStudioWorkflowSection";
import { LightCtaSection } from "./LightCtaSection";
import { LIGHT_HERO_VIDEO_ORIGIN } from "./hero-firstscreen-videos";

/** Published Figma Make site — static raster assets (bundle assetsVersion v11). */
const LIGHT_PAGE_ASSET_BASE = "https://trass-adobe-58736858.figma.site/_assets/v11";
const figmaAsset = (hash: string) => `${LIGHT_PAGE_ASSET_BASE}/${hash}.png`;

/** AI MOTION GRAPHICS poster URLs by asset (14, 竖屏1…); tiles map via `Frame45`–`Frame49` (slots 2↔4 and 5↔9 permuted vs default column wiring). Slot 10 (右下) uses 竖屏3.png poster. */
const CASE_MOTION_GRAPHICS_POSTERS = [
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/14.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/%E7%AB%96%E5%B1%8F1.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/13.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/%E7%AB%96%E5%B1%8F2.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/%E7%AB%96%E5%B1%8F4.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/12.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/%E7%AB%96%E5%B1%8F5.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/8.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/%E7%AB%96%E5%B1%8F6.png",
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/images/%E7%AB%96%E5%B1%8F3.png",
] as const;

const CASE_ANIMATION_STATIC = `${LIGHT_HERO_VIDEO_ORIGIN}/website/public/static`;
const CASE_ANIMATION_IMAGE_STATIC = `${CASE_ANIMATION_STATIC}/images`;

function caseAnimationPoster(col: number, row: number): string {
  return `${CASE_ANIMATION_IMAGE_STATIC}/animation_${col}_${row}.jpeg`;
}

/** AI Motion Graphics masonry — four landscape (h-216) tiles: hover to play remotion clips; default = first frame. */
const CASE_HORIZONTAL_MOTION_VIDEOS = [
  `${CASE_ANIMATION_STATIC}/animation_1_1.mp4`,
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/videos/remotion/13.mp4",
  `${CASE_ANIMATION_STATIC}/animation_3_1.mp4`,
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/videos/remotion/08.mp4",
] as const;

/** Portrait / tall masonry tiles (380, 480, flex). 竖屏1,4 + OSS animation_*（列内第 2 / 末格 flex）。 */
const CASE_VERTICAL_MOTION_VIDEOS = [
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/videos/remotion/%E7%AB%96%E5%B1%8F1.mp4",
  `${CASE_ANIMATION_STATIC}/animation_1_2.mp4`,
  "https://zhiyingguangnian-bj.oss-cn-beijing.aliyuncs.com/website/static/videos/remotion/%E7%AB%96%E5%B1%8F4.mp4",
  `${CASE_ANIMATION_STATIC}/animation_3_2.mp4`,
  `${CASE_ANIMATION_STATIC}/animation_2_2.mp4`,
  `${CASE_ANIMATION_STATIC}/animation_04.mp4`,
] as const;

/** `/light` — “Used by creators…” 双行跑马灯评价（上行 5 条、下行 5 条）。与 clipsparkagent-web 同源。 */
type LightReviewMarqueeEntry = { name: string; title: string; quote: string };

const LIGHT_REVIEWS_MARQUEE: LightReviewMarqueeEntry[] = [
  {
    name: "Alex Rivera",
    title: "FinTech Analyst",
    quote:
      "VizNow doesn't just edit; it understands my data. The way it evolves my raw market analysis into a cinematic K-line narrative is pure magic.",
  },
  {
    name: "Dr. Sarah Chen",
    title: "AI Researcher",
    quote:
      "Explaining neural networks used to be a week-long grind. With VizNow's Structural Blueprints, I spend my time on logic, and Viz handles the orchestration.",
  },
  {
    name: "Marcus Thorne",
    title: "History Storyteller",
    quote:
      "The 3D topographic maps changed my channel forever. My audience isn't just watching history; they are experiencing the geography of the past.",
  },
  {
    name: "Elena Vance",
    title: "Business Strategist",
    quote:
      "I've stopped thinking in 'clips'. Now, I work in a Living Document. The seamless transition from script to visual blocks is a paradigm shift.",
  },
  {
    name: "Liam K.",
    title: "Tech Reviewer",
    quote:
      "The Semantic Highlights feature is a retention monster. My watch time spiked by 45% because Viz knows exactly which keywords to visualize.",
  },
  {
    name: "Sophia Wu",
    title: "Legal Consultant",
    quote:
      "Making regulations engaging was my biggest hurdle. VizNow turns dry legal scripts into interactive visual nodes that anyone can follow.",
  },
  {
    name: "Julian Ross",
    title: "Science Communicator",
    quote:
      "Physics is abstract, but Viz makes it visceral. It's like having a Hollywood VFX director sitting right inside my browser.",
  },
  {
    name: "Tasha Moore",
    title: "Crypto Educator",
    quote:
      "I'm a one-person studio now. VizNow handles the semantic heavy lifting, allowing me to scale my content without a production team.",
  },
  {
    name: "Derek S.",
    title: "Economics Professor",
    quote:
      "My lectures used to be static. Now they are 'Living Classroom' narratives. It's the ultimate bridge between academic rigor and social engagement.",
  },
  {
    name: "Chloe Zhang",
    title: "Future Trends Blogger",
    quote:
      "Visual Enhancer gives me pixel-perfect control. I can refine the AI's artistic intent with a single prompt. It's a true creative partnership.",
  },
];

/**
 * Real portrait JPEGs from randomuser.me (Pravatar often 403s behind Cloudflare).
 * Deterministic per `name`; optional `salt` rotates the portrait on load error.
 */
function lightReviewMarqueeAvatarUrl(name: string, salt = 0): string {
  const seed = `${name.trim()}:${salt}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h);
  const pool = n % 2 === 0 ? "men" : "women";
  const id = n % 100;
  return `https://randomuser.me/api/portraits/${pool}/${id}.jpg`;
}

function ReviewMarqueeAvatar({ name }: { name: string }) {
  const [salt, setSalt] = useState(0);
  const src = lightReviewMarqueeAvatarUrl(name, salt);
  return (
    <img
      alt=""
      className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[200px] object-cover"
      src={src}
      loading="lazy"
      decoding="async"
      onError={() => setSalt((s) => (s < 24 ? s + 1 : s))}
    />
  );
}

function ReviewMarqueeStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@keyframes lightReviewMarqueeLeft{
  from{transform:translate3d(0,0,0)}
  to{transform:translate3d(-50%,0,0)}
}
@keyframes lightReviewMarqueeRight{
  from{transform:translate3d(-50%,0,0)}
  to{transform:translate3d(0,0,0)}
}
[data-light-reviews-marquee]{
  -webkit-mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);
  -webkit-mask-size:100% 100%;
  mask-size:100% 100%;
  -webkit-mask-repeat:no-repeat;
  mask-repeat:no-repeat;
}
[data-light-reviews-marquee] .light-review-marquee-track-left,
[data-light-reviews-marquee] .light-review-marquee-track-right{
  display:flex;
  width:max-content;
  will-change:transform;
}
[data-light-reviews-marquee] .light-review-marquee-track-left{
  animation:lightReviewMarqueeLeft 52s linear infinite;
}
[data-light-reviews-marquee] .light-review-marquee-track-right{
  animation:lightReviewMarqueeRight 56s linear infinite;
}
[data-light-reviews-marquee]:hover .light-review-marquee-track-left,
[data-light-reviews-marquee]:hover .light-review-marquee-track-right{
  animation-play-state:paused;
}
@media (prefers-reduced-motion:reduce){
  [data-light-reviews-marquee] .light-review-marquee-track-left,
  [data-light-reviews-marquee] .light-review-marquee-track-right{
    animation:none!important;
    transform:translate3d(0,0,0)!important;
  }
}`,
      }}
    />
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] opacity-80 relative shrink-0 text-[14px] w-full text-center">
        <p className="leading-[normal]">THEY BECAME THE STUDIO. SO CAN YOU.</p>
      </div>
      <h2
        id="light-heading-social-proof"
        className="m-0 font-normal flex flex-col font-['Questrial:Regular',sans-serif] justify-center leading-[1.15] not-italic relative shrink-0 text-[#1d1d1d] text-[40px] text-center w-full whitespace-pre-wrap min-[640px]:text-[48px] min-[900px]:text-[56px]"
      >
        <span className="mb-0 block">{`10,000+ Creators.`}</span>
        <span className="block">{`All Running Their Own Studio Now.`}</span>
      </h2>
      <div className="mt-[6px] flex max-w-[min(920px,100%)] flex-col font-['Poppins:Regular',sans-serif] justify-center text-center text-[16px] leading-[1.5] not-italic text-[#1d1d1d] opacity-60">
        <p className="m-0 leading-[1.5]">
          Empathing educators, analysts, and communicators to produce studio-grade, <br className="hidden min-[640px]:block" />high-retention content in a fraction of the time.
        </p>
      </div>
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex w-full max-w-[1200px] flex-col gap-[32px] items-center justify-center relative shrink-0 px-5 min-[900px]:px-0">
      <Frame37 />
    </div>
  );
}

function ReviewMarqueeReviewerRow({ name, title }: { name: string; title: string }) {
  return (
    <div className="inline-flex max-w-full min-w-0 shrink-0 items-center justify-start gap-[8px]">
      <div className="relative shrink-0 rounded-[200px] size-[40px] bg-[#e8e8ea]" data-name="Img">
        <ReviewMarqueeAvatar name={name} />
      </div>
      <div
        className="backdrop-blur-[5px] content-stretch flex w-fit min-w-0 max-w-[min(100%,260px)] flex-col items-start justify-center leading-[0] not-italic relative rounded-[16px] px-[10px] py-[4px] text-[#1d1d1d] shadow-[0px_4px_8px_0px_rgba(16,24,40,0.1),0px_2px_4px_0px_rgba(16,24,40,0.06)]"
        data-name="name"
      >
        <div className="relative flex shrink-0 flex-col justify-center font-['Poppins:Medium',sans-serif] text-[16px]">
          <p className="leading-[1.5]">{name}</p>
        </div>
        <div className="relative flex shrink-0 flex-col justify-center font-['Poppins:Regular',sans-serif] text-[12px] opacity-60">
          <p className="leading-[1.5]">{title}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewMarqueeStrip({ items, ariaHidden }: { items: LightReviewMarqueeEntry[]; ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 content-stretch gap-4 pr-4 items-stretch"
      data-name="Review line strip"
      aria-hidden={ariaHidden ? true : undefined}
    >
      {/*
        `pr-4` matches card `gap-4` at the strip seam (no double gap vs extra flex child).
      */}
      {items.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          className="relative flex min-h-[240px] w-[min(374px,calc(100vw-40px))] shrink-0 flex-col items-stretch rounded-[16px] bg-[rgba(214,215,219,0.2)] p-[20px]"
          data-name={`Review Item ${index}`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[16px] border border-solid border-white" />
          <p className="relative min-w-0 shrink-0 self-start font-['Inter',sans-serif] text-[16px] font-normal leading-[26px] not-italic text-[rgba(29,29,29,0.6)]">
            {item.quote}
          </p>
          {/* 顶部对齐文案 + 底部 publisher；可伸缩区至少 11px，与此前正文-底栏间距一致 */}
          <div className="min-h-[11px] min-w-0 flex-1 basis-0 shrink-0" aria-hidden />
          <div className="w-fit max-w-full shrink-0 self-start">
            <ReviewMarqueeReviewerRow name={item.name} title={item.title} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewMarqueeStrip1({ ariaHidden }: { ariaHidden?: boolean }) {
  return <ReviewMarqueeStrip items={LIGHT_REVIEWS_MARQUEE.slice(0, 5)} ariaHidden={ariaHidden} />;
}

function ReviewMarqueeStrip2({ ariaHidden }: { ariaHidden?: boolean }) {
  return <ReviewMarqueeStrip items={LIGHT_REVIEWS_MARQUEE.slice(5, 10)} ariaHidden={ariaHidden} />;
}

function Wrapper() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1318px] flex-col gap-4 overflow-hidden"
      data-name="Wrapper"
      data-light-reviews-marquee=""
    >
      <div className="w-full shrink-0 overflow-hidden">
        <div className="light-review-marquee-track-left">
          <ReviewMarqueeStrip1 />
          <ReviewMarqueeStrip1 ariaHidden />
        </div>
      </div>
      <div className="w-full shrink-0 overflow-hidden">
        <div className="light-review-marquee-track-right">
          <ReviewMarqueeStrip2 />
          <ReviewMarqueeStrip2 ariaHidden />
        </div>
      </div>
    </div>
  );
}

function Frame57() {
  return (
    <div className="relative w-full shrink-0">
      <Wrapper />
    </div>
  );
}

function Frame40() {
  return (
    <section
      className="relative flex w-full flex-col content-stretch items-center gap-[44px] bg-white px-0 py-[64px] min-[900px]:gap-[60px] min-[900px]:py-[80px]"
      aria-labelledby="light-heading-social-proof"
    >
      <ReviewMarqueeStyles />
      <Frame34 />
      <Frame57 />
    </section>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex w-full flex-col gap-[10px] items-start leading-[0] min-h-px min-w-px relative min-[900px]:flex-[1_0_0]">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center opacity-80 relative shrink-0 text-[14px] w-full">
        <p className="leading-[normal]">DYNAMIC MOTION GRAPHICS</p>
      </div>
      <h2
        className="m-0 font-normal flex flex-col font-['Questrial:Regular',sans-serif] justify-center relative shrink-0 text-[40px] w-full min-[640px]:text-[48px] min-[900px]:text-[56px]"
        id="light-heading-cases"
      >
        <span className="leading-[1.15] block">{`Make Your Ideas Move. Without After Effects.`}</span>
      </h2>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex w-full max-w-[1200px] flex-col gap-8 items-start not-italic relative shrink-0 text-[#1d1d1d] px-5 min-[900px]:flex-row min-[900px]:items-end min-[900px]:gap-[32px] min-[900px]:px-0">
      <Frame44 />
      <p className="w-full font-['Poppins:Regular',sans-serif] leading-[1.5] min-h-px min-w-px opacity-60 relative text-[16px] min-[900px]:flex-[1_0_0] min-[900px]:pb-[12px]">
        {`Skip generic stock footage—VizNow translates your script into credible, high-end motion graphics and data visualizations on the fly.`}
      </p>
    </div>
  );
}

function caseMasonryPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCaseMasonryHoverPointer(event: React.PointerEvent<HTMLDivElement>): boolean {
  return event.pointerType === "mouse";
}

/** Instant teardown for the previously hovered case tile when another tile is entered (only one plays). */
let caseMasonryActiveHardDismiss: (() => void) | null = null;

/** Tallest column content + `gap-[12px]` (col2: 480+12+256). Pins last tile bottoms via `mt-auto`. */
const CASE_MASONRY_LAYOUT_HEIGHT_CLASS = "h-[748px]";
const CASE_MASONRY_COLUMN_CLASS =
  "content-stretch flex h-full w-[282px] flex-col items-start gap-[12px] relative shrink-0";
const CASE_THUMB_PIN_BOTTOM_CLASS = "mt-auto";
const CASE_MOBILE_AUTOPLAY_EVENT = "light-case-mobile-autoplay";
const CASE_MOBILE_AUTOSCROLL_SPEED_PX_PER_SECOND = 26;
const CASE_MOBILE_AUTOSCROLL_RESUME_DELAY_MS = 2400;

/**
 * AI MOTION GRAPHICS case tile: **poster layer always mounted** (`data-light-case-thumb-poster`). On hover, a
 * second **overlay** `<video>` starts playback and fades in once media is ready; pointer leave fades out then
 * removes overlay `src` to save memory. Another tile’s hover hard-dismisses any active overlay first.
 */
function CaseMasonryVideoThumb({
  src,
  poster,
  wrapperClassName,
  mediaPositionClassName = "inset-0",
  mobileAutoplay = false,
}: {
  src: string;
  poster: string;
  wrapperClassName: string;
  /** Poster + overlay clip box; default full bleed. */
  mediaPositionClassName?: string;
  mobileAutoplay?: boolean;
}) {
  const posterIsVideo = /\.mp4(\?|$)/i.test(poster);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverRef = useRef(false);
  const overlayRevealRef = useRef(false);
  const mainSrcRef = useRef<string | null>(null);
  const leaveClearTimerRef = useRef<number | null>(null);
  const [mainSrc, setMainSrc] = useState<string | null>(null);
  const [overlayReveal, setOverlayReveal] = useState(false);
  const [mobileAutoPlaying, setMobileAutoPlaying] = useState(false);

  overlayRevealRef.current = overlayReveal;
  mainSrcRef.current = mainSrc;

  const clearLeaveTimer = useCallback(() => {
    if (leaveClearTimerRef.current != null) {
      window.clearTimeout(leaveClearTimerRef.current);
      leaveClearTimerRef.current = null;
    }
  }, []);

  const scheduleTeardownOverlay = useCallback(() => {
    clearLeaveTimer();
    leaveClearTimerRef.current = window.setTimeout(() => {
      leaveClearTimerRef.current = null;
      if (!hoverRef.current) {
        setMainSrc((s) => (s ? null : s));
        setOverlayReveal(false);
      }
    }, 140);
  }, [clearLeaveTimer]);

  const hardDismiss = useCallback(() => {
    clearLeaveTimer();
    hoverRef.current = false;
    setOverlayReveal(false);
    setMainSrc(null);
    const v = videoRef.current;
    if (v) {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
      v.removeAttribute("src");
      try {
        v.load();
      } catch {
        /* ignore */
      }
    }
  }, [clearLeaveTimer]);

  useEffect(() => {
    return () => {
      clearLeaveTimer();
      if (caseMasonryActiveHardDismiss === hardDismiss) {
        caseMasonryActiveHardDismiss = null;
      }
    };
  }, [hardDismiss, clearLeaveTimer]);

  const bindCasePosterImgRef = useCallback((el: HTMLImageElement | null) => {
    if (el) el.setAttribute("fetchpriority", "low");
  }, []);

  const bindCaseVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el) {
      el.setAttribute("fetchpriority", "high");
    }
  }, []);

  const startOverlay = useCallback(() => {
    if (caseMasonryPrefersReducedMotion()) return;
    if (caseMasonryActiveHardDismiss !== hardDismiss) {
      caseMasonryActiveHardDismiss?.();
      caseMasonryActiveHardDismiss = hardDismiss;
    }
    hoverRef.current = true;
    if (mainSrcRef.current !== src) {
      setMainSrc(src);
      setOverlayReveal(false);
      return;
    }
    if (videoRef.current && overlayRevealRef.current) {
      void videoRef.current.play().catch(() => {});
    }
  }, [src, hardDismiss]);

  const stopOverlay = useCallback(() => {
    if (caseMasonryActiveHardDismiss === hardDismiss) {
      caseMasonryActiveHardDismiss = null;
    }
    hoverRef.current = false;
    videoRef.current?.pause();
    if (mainSrcRef.current && !overlayRevealRef.current) {
      clearLeaveTimer();
      setMainSrc(null);
      setOverlayReveal(false);
      return;
    }
    setOverlayReveal(false);
    scheduleTeardownOverlay();
  }, [hardDismiss, clearLeaveTimer, scheduleTeardownOverlay]);

  const handlePointerEnter = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isCaseMasonryHoverPointer(event)) return;
    startOverlay();
  }, [startOverlay]);

  const handlePointerLeave = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isCaseMasonryHoverPointer(event)) return;
    setMobileAutoPlaying(false);
    stopOverlay();
  }, [stopOverlay]);

  const handleMouseEnter = useCallback(() => {
    startOverlay();
  }, [startOverlay]);

  const handleMouseLeave = useCallback(() => {
    setMobileAutoPlaying(false);
    stopOverlay();
  }, [stopOverlay]);

  useEffect(() => {
    if (!mobileAutoplay) return;
    const el = rootRef.current;
    if (!el || typeof window === "undefined") return;

    const handleMobileAutoplay = (event: Event) => {
      const active = (event as CustomEvent<{ active?: boolean }>).detail?.active === true;
      setMobileAutoPlaying(active);
      if (active) {
        startOverlay();
      } else {
        stopOverlay();
      }
    };

    el.addEventListener(CASE_MOBILE_AUTOPLAY_EVENT, handleMobileAutoplay as EventListener);
    return () => {
      el.removeEventListener(CASE_MOBILE_AUTOPLAY_EVENT, handleMobileAutoplay as EventListener);
    };
  }, [mobileAutoplay, startOverlay, stopOverlay]);

  useEffect(() => {
    if (!mainSrc) return;
    const v = videoRef.current;
    if (!v || !hoverRef.current || caseMasonryPrefersReducedMotion()) return;
    void v.play().catch(() => {});
  }, [mainSrc]);

  const handleOverlayReady = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hoverRef.current && !caseMasonryPrefersReducedMotion()) {
      void v.play().catch(() => {});
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (hoverRef.current) setOverlayReveal(true);
        });
      });
    } else {
      setOverlayReveal(false);
      setMainSrc(null);
    }
  }, []);

  const handleOverlayTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "opacity") return;
      if (hoverRef.current) return;
      clearLeaveTimer();
      setMainSrc((prev) => (prev ? null : prev));
      setOverlayReveal(false);
    },
    [clearLeaveTimer],
  );

  const handlePosterVideoLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      /* seek before data */
    }
  }, []);

  const caseThumbMediaClass =
    "pointer-events-none absolute inset-0 size-full max-w-none rounded-[inherit] object-cover";

  return (
    <div
      ref={rootRef}
      data-light-case-thumb=""
      data-light-case-thumb-deferred={!mainSrc && !posterIsVideo ? "" : undefined}
      data-light-case-thumb-mobile-active={mobileAutoPlaying ? "" : undefined}
      className={`relative overflow-hidden rounded-[12px] ${wrapperClassName}`}
      style={{ borderRadius: 12 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className={cn("absolute z-0 overflow-hidden rounded-[inherit]", mediaPositionClassName)}
      >
        {posterIsVideo ? (
          <video
            data-light-case-thumb-poster=""
            src={poster}
            className={caseThumbMediaClass}
            muted
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            aria-hidden
            onLoadedMetadata={handlePosterVideoLoadedMetadata}
          />
        ) : (
          <img
            ref={bindCasePosterImgRef}
            data-light-case-thumb-poster=""
            alt=""
            src={poster}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={caseThumbMediaClass}
          />
        )}
      </div>
      {mainSrc ? (
        <div
          data-light-case-thumb-overlay=""
          className={cn(
            "pointer-events-none absolute z-[2] rounded-[inherit]",
            mediaPositionClassName,
            overlayReveal ? "opacity-100" : "opacity-0",
          )}
          onTransitionEnd={handleOverlayTransitionEnd}
        >
          <video
            ref={bindCaseVideoRef}
            src={mainSrc}
            poster={posterIsVideo ? undefined : poster}
            className={caseThumbMediaClass}
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            controls={false}
            disablePictureInPicture
            aria-hidden
            onCanPlay={handleOverlayReady}
            onLoadedData={handleOverlayReady}
            onPlaying={handleOverlayReady}
          />
        </div>
      ) : null}
    </div>
  );
}

function CaseMobileCarouselStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-light-case-mobile-carousel]{
  -webkit-mask-image:linear-gradient(to right,transparent,#000 7%,#000 93%,transparent);
  mask-image:linear-gradient(to right,transparent,#000 7%,#000 93%,transparent);
  -webkit-mask-repeat:no-repeat;
  mask-repeat:no-repeat;
  -ms-overflow-style:none;
  scrollbar-width:none;
  scroll-behavior:auto;
  overscroll-behavior-x:contain;
}
[data-light-case-mobile-carousel]::-webkit-scrollbar{display:none}
[data-light-case-mobile-track]{
  display:flex;
  width:max-content;
}`,
      }}
    />
  );
}

function CaseMobileCarouselStrip({
  ariaHidden,
  mobileAutoplay = false,
}: {
  ariaHidden?: boolean;
  mobileAutoplay?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-stretch gap-[24px] pr-[24px] ${CASE_MASONRY_LAYOUT_HEIGHT_CLASS}`}
      data-light-case-mobile-masonry-strip=""
      aria-hidden={ariaHidden ? true : undefined}
    >
      <Frame45 mobileAutoplay={mobileAutoplay} />
      <Frame46 mobileAutoplay={mobileAutoplay} />
      <Frame47 mobileAutoplay={mobileAutoplay} />
      <Frame49 mobileAutoplay={mobileAutoplay} />
    </div>
  );
}

function CaseMobileCarousel() {
  const caseMobileScrollRef = useRef<HTMLDivElement | null>(null);
  const caseMobileTrackRef = useRef<HTMLDivElement | null>(null);
  const caseMobileStripWidthRef = useRef(0);
  const caseMobileAutoRafRef = useRef<number | null>(null);
  const caseMobileLastAutoTimeRef = useRef<number | null>(null);
  const caseMobileUserInteractingRef = useRef(false);
  const caseMobileResumeAutoTimerRef = useRef<number | null>(null);
  const mobileAutoplayActiveRef = useRef<HTMLElement | null>(null);
  const mobileAutoplayFrameRef = useRef<number | null>(null);

  const selectMobileAutoplayThumb = useCallback(() => {
    const carousel = caseMobileScrollRef.current;
    if (!carousel || typeof window === "undefined") return;

    const isMobile = window.matchMedia("(max-width: 899px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = mobileAutoplayActiveRef.current;
    if (!isMobile || reduceMotion) {
      if (previous) {
        previous.dispatchEvent(new CustomEvent(CASE_MOBILE_AUTOPLAY_EVENT, { detail: { active: false } }));
        mobileAutoplayActiveRef.current = null;
      }
      return;
    }

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const thumbs = Array.from(carousel.querySelectorAll<HTMLElement>("[data-light-case-thumb]"));
    let next: HTMLElement | null = null;
    let nextScore = Number.POSITIVE_INFINITY;

    thumbs.forEach((thumb) => {
      const rect = thumb.getBoundingClientRect();
      const visibleW = Math.max(0, Math.min(rect.right, viewportW) - Math.max(rect.left, 0));
      const visibleH = Math.max(0, Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0));
      const visibleArea = visibleW * visibleH;
      const area = rect.width * rect.height;
      if (area <= 0 || visibleArea / area < 0.42) return;

      const dx = rect.left + rect.width / 2 - viewportW / 2;
      const dy = rect.top + rect.height / 2 - viewportH * 0.52;
      const score = Math.hypot(dx * 1.35, dy * 0.72);
      if (score < nextScore) {
        next = thumb;
        nextScore = score;
      }
    });

    if (previous === next) return;
    if (previous) {
      previous.dispatchEvent(new CustomEvent(CASE_MOBILE_AUTOPLAY_EVENT, { detail: { active: false } }));
    }
    if (next) {
      next.dispatchEvent(new CustomEvent(CASE_MOBILE_AUTOPLAY_EVENT, { detail: { active: true } }));
    }
    mobileAutoplayActiveRef.current = next;
  }, []);

  const scheduleMobileAutoplaySelection = useCallback(() => {
    if (typeof window === "undefined" || mobileAutoplayFrameRef.current != null) return;
    mobileAutoplayFrameRef.current = window.requestAnimationFrame(() => {
      mobileAutoplayFrameRef.current = null;
      selectMobileAutoplayThumb();
    });
  }, [selectMobileAutoplayThumb]);

  const updateCaseMobileStripMetrics = useCallback(() => {
    const scrollEl = caseMobileScrollRef.current;
    const trackEl = caseMobileTrackRef.current;
    const firstStrip = trackEl?.querySelector<HTMLElement>("[data-light-case-mobile-masonry-strip]");
    const stripWidth = firstStrip?.offsetWidth ?? 0;
    if (!scrollEl || stripWidth <= 0) return;

    caseMobileStripWidthRef.current = stripWidth;
    if (scrollEl.scrollLeft < stripWidth * 0.5) {
      scrollEl.scrollLeft = stripWidth;
    }
  }, []);

  const normalizeCaseMobileScrollPosition = useCallback(() => {
    const scrollEl = caseMobileScrollRef.current;
    const stripWidth = caseMobileStripWidthRef.current;
    if (!scrollEl || stripWidth <= 0) return;

    if (scrollEl.scrollLeft < stripWidth * 0.5) {
      scrollEl.scrollLeft += stripWidth;
      return;
    }
    if (scrollEl.scrollLeft >= stripWidth * 1.5) {
      scrollEl.scrollLeft -= stripWidth;
    }
  }, []);

  const clearCaseMobileResumeTimer = useCallback(() => {
    if (caseMobileResumeAutoTimerRef.current != null) {
      window.clearTimeout(caseMobileResumeAutoTimerRef.current);
      caseMobileResumeAutoTimerRef.current = null;
    }
  }, []);

  const stopCaseMobileAutoscroll = useCallback(() => {
    if (caseMobileAutoRafRef.current != null) {
      window.cancelAnimationFrame(caseMobileAutoRafRef.current);
      caseMobileAutoRafRef.current = null;
    }
    caseMobileLastAutoTimeRef.current = null;
  }, []);

  const startCaseMobileAutoscroll = useCallback(() => {
    if (typeof window === "undefined" || caseMobileAutoRafRef.current != null) return;
    const isMobile = window.matchMedia("(max-width: 899px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isMobile || reduceMotion) return;

    const stepCaseMobileAutoscroll = (timestamp: number) => {
      const scrollEl = caseMobileScrollRef.current;
      if (!scrollEl) {
        caseMobileAutoRafRef.current = null;
        caseMobileLastAutoTimeRef.current = null;
        return;
      }

      const stillMobile = window.matchMedia("(max-width: 899px)").matches;
      const stillAllowsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!stillMobile || !stillAllowsMotion) {
        caseMobileAutoRafRef.current = null;
        caseMobileLastAutoTimeRef.current = null;
        scheduleMobileAutoplaySelection();
        return;
      }

      const previousTimestamp = caseMobileLastAutoTimeRef.current ?? timestamp;
      const elapsedMs = Math.min(64, timestamp - previousTimestamp);
      caseMobileLastAutoTimeRef.current = timestamp;

      if (!caseMobileUserInteractingRef.current) {
        scrollEl.scrollLeft += (CASE_MOBILE_AUTOSCROLL_SPEED_PX_PER_SECOND * elapsedMs) / 1000;
        normalizeCaseMobileScrollPosition();
        scheduleMobileAutoplaySelection();
      }

      caseMobileAutoRafRef.current = window.requestAnimationFrame(stepCaseMobileAutoscroll);
    };

    caseMobileLastAutoTimeRef.current = null;
    caseMobileAutoRafRef.current = window.requestAnimationFrame(stepCaseMobileAutoscroll);
  }, [normalizeCaseMobileScrollPosition, scheduleMobileAutoplaySelection]);

  const scheduleCaseMobileAutoscrollResume = useCallback(() => {
    if (typeof window === "undefined") return;
    clearCaseMobileResumeTimer();
    caseMobileResumeAutoTimerRef.current = window.setTimeout(startCaseMobileAutoscroll, CASE_MOBILE_AUTOSCROLL_RESUME_DELAY_MS);
  }, [clearCaseMobileResumeTimer, startCaseMobileAutoscroll]);

  const handleCarouselPointerDown = useCallback(() => {
    caseMobileUserInteractingRef.current = true;
    clearCaseMobileResumeTimer();
    stopCaseMobileAutoscroll();
    scheduleMobileAutoplaySelection();
  }, [clearCaseMobileResumeTimer, scheduleMobileAutoplaySelection, stopCaseMobileAutoscroll]);

  const handleCarouselPointerRelease = useCallback(() => {
    caseMobileUserInteractingRef.current = false;
    scheduleMobileAutoplaySelection();
    scheduleCaseMobileAutoscrollResume();
  }, [scheduleCaseMobileAutoscrollResume, scheduleMobileAutoplaySelection]);

  const handleCarouselScroll = useCallback(() => {
    normalizeCaseMobileScrollPosition();
    scheduleMobileAutoplaySelection();
    if (caseMobileResumeAutoTimerRef.current != null && !caseMobileUserInteractingRef.current) {
      scheduleCaseMobileAutoscrollResume();
    }
  }, [normalizeCaseMobileScrollPosition, scheduleCaseMobileAutoscrollResume, scheduleMobileAutoplaySelection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    updateCaseMobileStripMetrics();
    scheduleMobileAutoplaySelection();
    startCaseMobileAutoscroll();

    const timer = window.setInterval(scheduleMobileAutoplaySelection, 700);
    let resizeObserver: ResizeObserver | null = null;
    const handleViewportChange = () => {
      updateCaseMobileStripMetrics();
      scheduleMobileAutoplaySelection();
      startCaseMobileAutoscroll();
    };

    if (typeof ResizeObserver !== "undefined" && caseMobileTrackRef.current) {
      resizeObserver = new ResizeObserver(handleViewportChange);
      resizeObserver.observe(caseMobileTrackRef.current);
    }

    window.addEventListener("resize", scheduleMobileAutoplaySelection);
    window.addEventListener("orientationchange", handleViewportChange);
    window.addEventListener("resize", handleViewportChange);
    return () => {
      clearCaseMobileResumeTimer();
      stopCaseMobileAutoscroll();
      resizeObserver?.disconnect();
      window.clearInterval(timer);
      window.removeEventListener("resize", scheduleMobileAutoplaySelection);
      window.removeEventListener("orientationchange", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
      if (mobileAutoplayFrameRef.current != null) {
        window.cancelAnimationFrame(mobileAutoplayFrameRef.current);
        mobileAutoplayFrameRef.current = null;
      }
      const previous = mobileAutoplayActiveRef.current;
      if (previous) {
        previous.dispatchEvent(new CustomEvent(CASE_MOBILE_AUTOPLAY_EVENT, { detail: { active: false } }));
        mobileAutoplayActiveRef.current = null;
      }
    };
  }, [
    clearCaseMobileResumeTimer,
    scheduleMobileAutoplaySelection,
    startCaseMobileAutoscroll,
    stopCaseMobileAutoscroll,
    updateCaseMobileStripMetrics,
  ]);

  return (
    <div
      ref={caseMobileScrollRef}
      aria-label="Motion graphics carousel"
      className="block w-full overflow-x-auto overflow-y-hidden [touch-action:pan-x_pan-y] min-[900px]:hidden"
      data-light-case-mobile-carousel=""
      onBlur={handleCarouselPointerRelease}
      onFocus={handleCarouselPointerDown}
      onPointerCancel={handleCarouselPointerRelease}
      onPointerDown={handleCarouselPointerDown}
      onPointerLeave={handleCarouselPointerRelease}
      onPointerUp={handleCarouselPointerRelease}
      onScroll={handleCarouselScroll}
      tabIndex={0}
    >
      <CaseMobileCarouselStyles />
      <div ref={caseMobileTrackRef} data-light-case-mobile-track="">
        <CaseMobileCarouselStrip mobileAutoplay />
        <CaseMobileCarouselStrip ariaHidden mobileAutoplay />
      </div>
    </div>
  );
}

function Frame45({ mobileAutoplay = false }: { mobileAutoplay?: boolean }) {
  return (
    <div className={CASE_MASONRY_COLUMN_CLASS}>
      <CaseMasonryVideoThumb
        src={CASE_HORIZONTAL_MOTION_VIDEOS[0]}
        poster={caseAnimationPoster(1, 1)}
        wrapperClassName="h-[216px] shrink-0 w-full"
        mobileAutoplay={mobileAutoplay}
      />
      <CaseMasonryVideoThumb
        src={CASE_VERTICAL_MOTION_VIDEOS[1]}
        poster={caseAnimationPoster(1, 2)}
        wrapperClassName="h-[275px] shrink-0 w-full"
        mediaPositionClassName="left-0 right-0 bottom-0 top-[-4px]"
        mobileAutoplay={mobileAutoplay}
      />
      <CaseMasonryVideoThumb
        src={CASE_HORIZONTAL_MOTION_VIDEOS[1]}
        poster={CASE_MOTION_GRAPHICS_POSTERS[2]}
        wrapperClassName={`h-[216px] shrink-0 w-full ${CASE_THUMB_PIN_BOTTOM_CLASS}`}
        mobileAutoplay={mobileAutoplay}
      />
    </div>
  );
}

function Frame46({ mobileAutoplay = false }: { mobileAutoplay?: boolean }) {
  return (
    <div className={CASE_MASONRY_COLUMN_CLASS}>
      <CaseMasonryVideoThumb
        src={CASE_VERTICAL_MOTION_VIDEOS[0]}
        poster={CASE_MOTION_GRAPHICS_POSTERS[1]}
        wrapperClassName="h-[480px] shrink-0 w-full"
        mobileAutoplay={mobileAutoplay}
      />
      <CaseMasonryVideoThumb
        src={CASE_VERTICAL_MOTION_VIDEOS[4]}
        poster={caseAnimationPoster(2, 2)}
        wrapperClassName={`h-[256px] shrink-0 w-full ${CASE_THUMB_PIN_BOTTOM_CLASS}`}
        mobileAutoplay={mobileAutoplay}
      />
    </div>
  );
}

function Frame47({ mobileAutoplay = false }: { mobileAutoplay?: boolean }) {
  return (
    <div className={CASE_MASONRY_COLUMN_CLASS}>
      <CaseMasonryVideoThumb
        src={CASE_HORIZONTAL_MOTION_VIDEOS[2]}
        poster={caseAnimationPoster(3, 1)}
        wrapperClassName="h-[160px] shrink-0 w-full"
        mobileAutoplay={mobileAutoplay}
      />
      <CaseMasonryVideoThumb
        src={CASE_VERTICAL_MOTION_VIDEOS[3]}
        poster={caseAnimationPoster(3, 2)}
        wrapperClassName="h-[252px] shrink-0 w-full"
        mobileAutoplay={mobileAutoplay}
      />
      <CaseMasonryVideoThumb
        src={CASE_VERTICAL_MOTION_VIDEOS[5]}
        poster={caseAnimationPoster(4, 2)}
        wrapperClassName={`h-[306px] shrink-0 w-full ${CASE_THUMB_PIN_BOTTOM_CLASS}`}
        mobileAutoplay={mobileAutoplay}
      />
    </div>
  );
}

function Frame49({ mobileAutoplay = false }: { mobileAutoplay?: boolean }) {
  return (
    <div className={CASE_MASONRY_COLUMN_CLASS}>
      <CaseMasonryVideoThumb
        src={CASE_VERTICAL_MOTION_VIDEOS[2]}
        poster={CASE_MOTION_GRAPHICS_POSTERS[4]}
        wrapperClassName="h-[480px] shrink-0 w-full"
        mobileAutoplay={mobileAutoplay}
      />
      <CaseMasonryVideoThumb
        src={CASE_HORIZONTAL_MOTION_VIDEOS[3]}
        poster={CASE_MOTION_GRAPHICS_POSTERS[7]}
        wrapperClassName={`h-[247px] shrink-0 w-full ${CASE_THUMB_PIN_BOTTOM_CLASS}`}
        mobileAutoplay={mobileAutoplay}
      />
    </div>
  );
}

function CaseLayout() {
  return (
    <div
      className={`hidden w-full max-w-[1200px] items-stretch justify-center gap-[24px] px-0 relative shrink-0 min-[900px]:flex ${CASE_MASONRY_LAYOUT_HEIGHT_CLASS}`}
      data-name="Case layout"
      data-light-case-desktop-layout=""
    >
      <Frame45 />
      <Frame46 />
      <Frame47 />
      <Frame49 />
    </div>
  );
}

function Frame41() {
  return (
    <section
      className="relative flex w-full flex-col content-stretch items-center gap-[44px] bg-white pt-[40px] pb-[64px] min-[900px]:gap-[60px] min-[900px]:py-[80px]"
      aria-labelledby="light-heading-cases"
    >
      <Frame43 />
      <CaseMobileCarousel />
      <CaseLayout />
    </section>
  );
}

/** Below-the-fold sections — lazy-loaded in the browser; full tree in Node SSR (static public/index.html). */
export function BelowFoldSections() {
  return (
    <>
      <Frame41 />
      <Frame40 />
      <LightSixWaysSection />
      <LightStudioWorkflowSection />
      <LightCtaSection />
      <LightMarketingFooter variant="light-gray" />
    </>
  );
}
