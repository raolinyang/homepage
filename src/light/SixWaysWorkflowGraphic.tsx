import { useId } from "react";
import { cn } from "@/lib/utils";

/** ONE-CREATOR GLOBAL STUDIO wide card — workflow UI illustration (Figma export). */
export function SixWaysWorkflowGraphic({
  animate,
  revealMs = 1200,
}: {
  animate?: boolean;
  revealMs?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const clip0 = `${uid}-clip0`;
  const clip1 = `${uid}-clip1`;
  const maskTop = `${uid}-mask-top`;
  const maskBottom = `${uid}-mask-bottom`;
  const filterBlur = `${uid}-filter-blur`;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 flex w-[min(52%,313px)] translate-y-[30px] items-center justify-end overflow-hidden pr-2"
      aria-hidden
    >
      <div
        className={cn(
          "flex w-full items-center justify-end will-change-[clip-path]",
          animate ? "ease-[cubic-bezier(0.22,1,0.36,1)]" : "",
        )}
        style={{
          clipPath: animate ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          transition: animate ? `clip-path ${revealMs}ms cubic-bezier(0.22, 1, 0.36, 1)` : undefined,
        }}
      >
      <svg
        viewBox="0 0 313 298"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full max-h-[min(100%,298px)] max-w-[313px]"
        data-light-workflow-graphic
        preserveAspectRatio="xMaxYMid meet"
      >
        <g clipPath={`url(#${clip0})`}>
          <path
            d="M94 16C94 7.16345 101.163 0 110 0H243C251.837 0 259 7.16344 259 16V131C259 139.837 251.837 147 243 147H110C101.163 147 94 139.837 94 131V16Z"
            fill="#E9F0FF"
          />
          <mask id={maskTop} fill="white">
            <path d="M110 0H243V41H110V0Z" />
          </mask>
          <path d="M243 41V40H110V41V42H243V41Z" fill="#D6D7DB" mask={`url(#${maskTop})`} />
          <rect x="110" y="12" width="93" height="17" rx="4" fill="#7096FF" />
          <path
            d="M110 65C110 58.3726 115.373 53 122 53H231C237.627 53 243 58.3726 243 65V119C243 125.627 237.627 131 231 131H122C115.373 131 110 125.627 110 119V65Z"
            fill="white"
            fillOpacity="0.5"
          />
          <rect x="122" y="69" width="57" height="17" rx="4" fill="#7096FF" />
          <rect x="122" y="98" width="109" height="17" rx="4" fill="#7096FF" />
        </g>
        <g clipPath={`url(#${clip1})`}>
          <path
            d="M94 184C94 175.163 101.163 168 110 168H243C251.837 168 259 175.163 259 184V299C259 307.837 251.837 315 243 315H110C101.163 315 94 307.837 94 299V184Z"
            fill="#E9F0FF"
          />
          <mask id={maskBottom} fill="white">
            <path d="M110 168H243V209H110V168Z" />
          </mask>
          <path d="M243 209V208H110V209V210H243V209Z" fill="#D6D7DB" mask={`url(#${maskBottom})`} />
          <rect x="110" y="180" width="93" height="17" rx="4" fill="#7096FF" />
          <path
            d="M110 233C110 226.373 115.373 221 122 221H231C237.627 221 243 226.373 243 233V287C243 293.627 237.627 299 231 299H122C115.373 299 110 293.627 110 287V233Z"
            fill="white"
            fillOpacity="0.5"
          />
          <rect x="122" y="237" width="57" height="17" rx="4" fill="#7096FF" />
          <rect x="122" y="266" width="109" height="17" rx="4" fill="#7096FF" />
        </g>
        <path
          d="M178 148L178 147L176 147L176 148L177 148L178 148ZM177 169L182.774 159L171.226 159L177 169ZM177 148L176 148L176 160L177 160L178 160L178 148L177 148Z"
          fill="#7096FF"
        />
        <g filter={`url(#${filterBlur})`}>
          <rect x="50" y="228" width="277" height="181" fill="white" />
        </g>
        <defs>
          <filter
            id={filterBlur}
            x="0"
            y="178"
            width="377"
            height="281"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="25" result="effect1_foregroundBlur" />
          </filter>
          <clipPath id={clip0}>
            <path
              d="M94 16C94 7.16345 101.163 0 110 0H243C251.837 0 259 7.16344 259 16V131C259 139.837 251.837 147 243 147H110C101.163 147 94 139.837 94 131V16Z"
              fill="white"
            />
          </clipPath>
          <clipPath id={clip1}>
            <path
              d="M94 184C94 175.163 101.163 168 110 168H243C251.837 168 259 175.163 259 184V299C259 307.837 251.837 315 243 315H110C101.163 315 94 307.837 94 299V184Z"
              fill="white"
            />
          </clipPath>
        </defs>
      </svg>
      </div>
    </div>
  );
}
