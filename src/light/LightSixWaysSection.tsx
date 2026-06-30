import { useCallback, useEffect, useRef, useState, type TransitionEvent } from "react";
import { cn } from "@/lib/utils";
import { LIGHT_GRAY_FULL_BLEED_STYLE } from "./light-floor-layout";
import { SixWaysWorkflowGraphic } from "./SixWaysWorkflowGraphic";

type SixWaysCardConfig = {
  title: string;
  body: string;
  wide: boolean;
  dotted?: boolean;
  graphic: "bar-chart" | "workflow" | null;
  icon: "chart" | "book" | "sync" | "layers" | "film" | "sparkle";
};

const SIX_WAYS_CARDS: SixWaysCardConfig[] = [
  {
    title: "DATA-DRIVEN IDEATION",
    body: "Scan global search trends and social zeitgeist to instantly discover high-potential, audience-driven topics in your niche.",
    wide: true,
    graphic: "bar-chart",
    icon: "chart",
  },
  {
    title: "DEEP SCRIPT INTELLIGENCE",
    body: "Analyze the tone, pacing, and logic of your script to build a structural blueprint optimized for maximum audience retention.",
    wide: false,
    graphic: null,
    icon: "book",
  },
  {
    title: "SEMANTIC VISUAL MAPPING",
    body: "Semantically map every narrative beat to precision visual evidence, from 3D data charts to topographic maps.",
    wide: false,
    dotted: true,
    graphic: null,
    icon: "sync",
  },
  {
    title: "DIRECTOR-MODE ORCHESTRATION",
    body: "Command your visual blocks in natural language to adjust compositions and refine artistic intent like a director.",
    wide: false,
    graphic: null,
    icon: "layers",
  },
  {
    title: "PREMIUM ASSET LIBRARY",
    body: "Access a studio-grade library of 3D data canvases, geopolitical maps, and kinetic typography without stock footage hunting.",
    wide: false,
    dotted: true,
    graphic: null,
    icon: "film",
  },
  {
    title: "ONE-CREATOR GLOBAL STUDIO",
    body: "Synthesize platform-ready visual masterpieces with the throughput of an entire production house—minus the headcount.",
    wide: true,
    graphic: "workflow",
    icon: "sparkle",
  },
];

type SixWaysIconId = SixWaysCardConfig["icon"];

const SIX_WAYS_ICON_FRAME = (
  <>
    <rect x="0.5" y="0.5" width="47" height="47" rx="9.5" fill="white" />
    <rect x="0.5" y="0.5" width="47" height="47" rx="9.5" stroke="#D6D7DB" />
  </>
);

function SixWaysIconChart() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="size-12 shrink-0" data-light-floor-icon aria-hidden>
      {SIX_WAYS_ICON_FRAME}
      <path
        d="M15 15V31C15 31.5304 15.2107 32.0391 15.5858 32.4142C15.9609 32.7893 16.4696 33 17 33H33"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 21L26 26L22 22L19 25"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SixWaysIconBook() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="size-12 shrink-0" data-light-floor-icon aria-hidden>
      {SIX_WAYS_ICON_FRAME}
      <path
        d="M16 31.5V16.5C16 15.837 16.2634 15.2011 16.7322 14.7322C17.2011 14.2634 17.837 14 18.5 14H31C31.2652 14 31.5196 14.1054 31.7071 14.2929C31.8946 14.4804 32 14.7348 32 15V33C32 33.2652 31.8946 33.5196 31.7071 33.7071C31.5196 33.8946 31.2652 34 31 34H18.5C17.837 34 17.2011 33.7366 16.7322 33.2678C16.2634 32.7989 16 32.163 16 31.5ZM16 31.5C16 30.837 16.2634 30.2011 16.7322 29.7322C17.2011 29.2634 17.837 29 18.5 29H32"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 22H27" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SixWaysIconSync() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="size-12 shrink-0" data-light-floor-icon aria-hidden>
      {SIX_WAYS_ICON_FRAME}
      <path
        d="M33 24C33 21.6131 32.0518 19.3239 30.364 17.636C28.6761 15.9482 26.3869 15 24 15C21.484 15.0095 19.069 15.9912 17.26 17.74L15 20"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 15V20H20" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15 24C15 26.3869 15.9482 28.6761 17.636 30.364C19.3239 32.0518 21.6131 33 24 33C26.516 32.9905 28.931 32.0088 30.74 30.26L33 28"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 28H33V33" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M24 25C24.5523 25 25 24.5523 25 24C25 23.4477 24.5523 23 24 23C23.4477 23 23 23.4477 23 24C23 24.5523 23.4477 25 24 25Z"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SixWaysIconLayers() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="size-12 shrink-0" data-light-floor-icon aria-hidden>
      {SIX_WAYS_ICON_FRAME}
      <path d="M19 14H29" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 18H31" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M31 22H17C15.8954 22 15 22.8954 15 24V32C15 33.1046 15.8954 34 17 34H31C32.1046 34 33 33.1046 33 32V24C33 22.8954 32.1046 22 31 22Z"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SixWaysIconFilm() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="size-12 shrink-0" data-light-floor-icon aria-hidden>
      {SIX_WAYS_ICON_FRAME}
      <path
        d="M31 15H17C15.8954 15 15 15.8954 15 17V31C15 32.1046 15.8954 33 17 33H31C32.1046 33 33 32.1046 33 31V17C33 15.8954 32.1046 15 31 15Z"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M19 15V33" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 19.5H19" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 24H33" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 28.5H19" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 15V33" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 19.5H33" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 28.5H33" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SixWaysIconSparkle() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="size-12 shrink-0" data-light-floor-icon aria-hidden>
      {SIX_WAYS_ICON_FRAME}
      <path
        d="M23.017 14.8144C23.0598 14.585 23.1815 14.3779 23.3611 14.2288C23.5406 14.0797 23.7666 13.998 24 13.998C24.2333 13.998 24.4593 14.0797 24.6389 14.2288C24.8184 14.3779 24.9401 14.585 24.983 14.8144L26.034 20.3724C26.1086 20.7676 26.3006 21.1311 26.585 21.4154C26.8693 21.6998 27.2328 21.8918 27.628 21.9664L33.186 23.0174C33.4153 23.0603 33.6225 23.182 33.7716 23.3615C33.9207 23.5411 34.0023 23.7671 34.0023 24.0004C34.0023 24.2338 33.9207 24.4598 33.7716 24.6393C33.6225 24.8189 33.4153 24.9406 33.186 24.9834L27.628 26.0344C27.2328 26.1091 26.8693 26.3011 26.585 26.5855C26.3006 26.8698 26.1086 27.2333 26.034 27.6284L24.983 33.1864C24.9401 33.4158 24.8184 33.623 24.6389 33.7721C24.4593 33.9212 24.2333 34.0028 24 34.0028C23.7666 34.0028 23.5406 33.9212 23.3611 33.7721C23.1815 33.623 23.0598 33.4158 23.017 33.1864L21.966 27.6284C21.8913 27.2333 21.6993 26.8698 21.4149 26.5855C21.1306 26.3011 20.7671 26.1091 20.372 26.0344L14.814 24.9834C14.5846 24.9406 14.3774 24.8189 14.2283 24.6393C14.0792 24.4598 13.9976 24.2338 13.9976 24.0004C13.9976 23.7671 14.0792 23.5411 14.2283 23.3615C14.3774 23.182 14.5846 23.0603 14.814 23.0174L20.372 21.9664C20.7671 21.8918 21.1306 21.6998 21.4149 21.4154C21.6993 21.1311 21.8913 20.7676 21.966 20.3724L23.017 14.8144Z"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M32 14V18" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 16H30" stroke="#111114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M16 34C17.1046 34 18 33.1046 18 32C18 30.8954 17.1046 30 16 30C14.8954 30 14 30.8954 14 32C14 33.1046 14.8954 34 16 34Z"
        stroke="#111114"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SIX_WAYS_ICONS: Record<SixWaysIconId, () => JSX.Element> = {
  chart: SixWaysIconChart,
  book: SixWaysIconBook,
  sync: SixWaysIconSync,
  layers: SixWaysIconLayers,
  film: SixWaysIconFilm,
  sparkle: SixWaysIconSparkle,
};

function SixWaysIcon({ id }: { id: SixWaysIconId }) {
  const Icon = SIX_WAYS_ICONS[id];
  return <Icon />;
}

const BAR_CHART_HEIGHTS = [72, 48, 88, 56, 96] as const;
/** Bar grow duration (+350ms vs initial). */
const BAR_GROW_MS = 900;
const BAR_STAGGER_MS = 120;
/** Workflow reveal duration — same +350ms bump as bar grow. */
const WORKFLOW_REVEAL_MS = 1200;
/** Pause after bar sequence before workflow starts — same +350ms as duration bump. */
const BETWEEN_ANIMS_MS = 350;

function sixWaysPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function BarChartGraphic({
  animate,
  onGrowComplete,
}: {
  animate: boolean;
  onGrowComplete?: () => void;
}) {
  const lastIndex = BAR_CHART_HEIGHTS.length - 1;

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>, index: number) => {
    if (!animate || index !== lastIndex || event.propertyName !== "height") return;
    onGrowComplete?.();
  };

  return (
    <div
      className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-[min(42%,220px)] items-end justify-center gap-[10px] px-6 pb-6 pt-10"
      data-light-bar-chart
      aria-hidden
    >
      {BAR_CHART_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-[28px] origin-bottom rounded-t-[6px] will-change-[height]"
          style={{
            height: animate ? `${h}%` : "0%",
            transition: animate
              ? `height ${BAR_GROW_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * BAR_STAGGER_MS}ms`
              : "height 0ms",
            background:
              "linear-gradient(180deg, rgba(36,102,255,0.55) 0%, rgba(36,102,255,0.12) 70%, rgba(36,102,255,0) 100%)",
          }}
          onTransitionEnd={(event) => handleTransitionEnd(event, i)}
        />
      ))}
    </div>
  );
}

function SixWaysCard({
  title,
  body,
  wide,
  dotted,
  graphic,
  icon,
  barAnimate,
  workflowAnimate,
  onBarGrowComplete,
}: SixWaysCardConfig & {
  barAnimate?: boolean;
  workflowAnimate?: boolean;
  onBarGrowComplete?: () => void;
}) {
  return (
    <article
      className={cn(
        "relative flex min-h-[240px] flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.04)]",
        wide ? "col-span-1 min-[900px]:col-span-2" : "col-span-1",
      )}
    >
      {dotted ? (
        <div
          data-light-card-dots
          className="pointer-events-none absolute right-0 top-0 size-[120px] opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(29,29,29,0.12) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
          aria-hidden
        />
      ) : null}
      <div className={cn("relative z-[1] flex flex-col gap-4", wide && "max-w-[min(100%,58%)]")}>
        <SixWaysIcon id={icon} />
        <div className="flex flex-col gap-2">
          <h3 className="m-0 font-['Poppins:Medium',sans-serif] text-[14px] font-medium leading-[1.3] tracking-[0.02em] text-[#1d1d1d]">
            {title}
          </h3>
          <p className="m-0 font-['Plus_Jakarta_Sans:Regular',sans-serif] text-[14px] font-normal leading-[1.55] text-[#1d1d1d]/60">
            {body}
          </p>
        </div>
      </div>
      {graphic === "bar-chart" ? (
        <BarChartGraphic animate={barAnimate ?? false} onGrowComplete={onBarGrowComplete} />
      ) : null}
      {graphic === "workflow" ? (
        <SixWaysWorkflowGraphic animate={workflowAnimate} revealMs={WORKFLOW_REVEAL_MS} />
      ) : null}
    </article>
  );
}

function SixWaysHeader() {
  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-8 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between min-[900px]:gap-12">
      <div className="flex min-w-0 flex-[1_1_0] flex-col gap-[10px]">
        <p className="m-0 font-['Poppins:Regular',sans-serif] text-[14px] leading-normal text-[#1d1d1d]/80">
          THE DIRECTOR&apos;S CHAIR IS YOURS
        </p>
        <h2
          id="light-heading-value-props"
          className="m-0 font-['Questrial:Regular',sans-serif] text-[40px] font-normal leading-[1.12] text-[#1d1d1d] min-[640px]:text-[48px] min-[900px]:text-[56px]"
        >
          Six Ways VizNow <br/> Makes You The Studio
        </h2>
      </div>
      <p className="m-0 max-w-[420px] shrink-0 font-['Poppins:Regular',sans-serif] text-[16px] leading-[1.5] text-[#1d1d1d]/60 min-[900px]:pb-[6px]">
        Reuniting expertise with execution to give every knowledge creator the production authority of a full agency.
      </p>
    </div>
  );
}

/** `/light` — "Six Ways VizNow Makes You The Studio" feature grid (replaces WHY CREATORS USE US). */
export function LightSixWaysSection() {
  const [barAnimate, setBarAnimate] = useState(false);
  const [workflowAnimate, setWorkflowAnimate] = useState(false);
  const sequencePlayedRef = useRef(false);
  const betweenAnimTimerRef = useRef<number | null>(null);

  const handleSectionMouseEnter = useCallback(() => {
    if (sequencePlayedRef.current) return;
    sequencePlayedRef.current = true;

    if (sixWaysPrefersReducedMotion()) {
      setBarAnimate(true);
      setWorkflowAnimate(true);
      return;
    }

    setBarAnimate(true);
  }, []);

  const handleBarGrowComplete = useCallback(() => {
    if (betweenAnimTimerRef.current !== null) return;
    betweenAnimTimerRef.current = window.setTimeout(() => {
      betweenAnimTimerRef.current = null;
      setWorkflowAnimate(true);
    }, BETWEEN_ANIMS_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (betweenAnimTimerRef.current !== null) {
        window.clearTimeout(betweenAnimTimerRef.current);
      }
    };
  }, []);

  return (
    <section
      data-light-floor
      data-light-six-ways=""
      className="relative box-border flex flex-col items-center gap-[48px] bg-[#f4f4f5] px-5 py-[64px] min-[900px]:gap-[60px] min-[900px]:py-[80px]"
      style={LIGHT_GRAY_FULL_BLEED_STYLE}
      aria-labelledby="light-heading-value-props"
      onMouseEnter={handleSectionMouseEnter}
    >
      <SixWaysHeader />
      <div className="grid w-full max-w-[1200px] grid-cols-1 gap-5 min-[900px]:grid-cols-4 min-[900px]:gap-6">
        {SIX_WAYS_CARDS.map((card, index) => (
          <SixWaysCard
            key={card.title}
            {...card}
            barAnimate={index === 0 ? barAnimate : undefined}
            workflowAnimate={index === SIX_WAYS_CARDS.length - 1 ? workflowAnimate : undefined}
            onBarGrowComplete={index === 0 ? handleBarGrowComplete : undefined}
          />
        ))}
      </div>
    </section>
  );
}
