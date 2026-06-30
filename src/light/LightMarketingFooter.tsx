import { DISCORD_INVITE_URL } from "@/lib/links";
import { cn } from "@/lib/utils";
import { LIGHT_GRAY_FULL_BLEED_STYLE } from "./light-floor-layout";
import { VizNowAiLogo } from "./VizNowAiLogo";

export type LightMarketingFooterProps = {
  /** `/light` marketing page: `#f4f4f5` band continuous with bottom CTA. */
  variant?: "theme" | "light-gray";
};

/**
 * Marketing footer layout from `/light` (LightSections), styled with V2 design tokens
 * so `data-mode` / theme matches the rest of the app (e.g. `/` HomeV2Layout).
 */
export function LightMarketingFooter({ variant = "theme" }: LightMarketingFooterProps) {
  const isLightGray = variant === "light-gray";

  const linkClass = cn(
    "relative shrink-0 whitespace-nowrap text-center font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[14px] font-medium leading-[24px] no-underline transition-colors",
    isLightGray
      ? "text-[#1d1d1d]/70 hover:text-[#1d1d1d]"
      : "text-[var(--text-icon-text-icon02)] hover:text-[var(--text-icon-text-icon01)]",
  );
  const mutedClass = cn(
    "relative shrink-0 whitespace-nowrap font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[15px] font-medium leading-[24px]",
    isLightGray ? "text-[#1d1d1d]/50" : "text-[var(--text-icon-text-icon03)]",
  );

  return (
    <footer
      data-light-floor={isLightGray ? "" : undefined}
      className={cn(
        "relative box-border flex w-full flex-col items-center py-[60px] transition-colors duration-200",
        isLightGray
          ? "border-t border-[#d6d7db]/80 bg-[#f4f4f5] text-[#1d1d1d]"
          : "border-t border-[var(--line-line)] bg-[var(--bg-main-1)] text-[var(--text-icon-text-icon01)]",
      )}
      style={isLightGray ? LIGHT_GRAY_FULL_BLEED_STYLE : undefined}
    >
      {/* Match `/light` artboard: content lives inside `width: min(100%, 1440px)` (see LightPreview). */}
      <div className="relative mx-auto w-full max-w-[1440px] shrink-0">
        <div className="relative w-full shrink-0">
          <div className="flex size-full flex-col min-[900px]:flex-row min-[900px]:justify-end">
            <div className="content-stretch relative flex w-full flex-col items-start gap-10 px-5 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-end min-[900px]:gap-[140px] min-[900px]:px-[80px]">
              <div className="content-stretch relative flex shrink-0 flex-col items-start gap-6 min-[900px]:justify-between min-[900px]:self-stretch">
                <div className="relative shrink-0">
                  <VizNowAiLogo color="theme" />
                </div>
                <p className={mutedClass}>© {new Date().getFullYear()} VizNow. All rights reserved.</p>
              </div>
              <div className="relative flex min-h-px w-full min-w-px flex-col items-start gap-8 min-[640px]:flex-row min-[640px]:gap-[40px] min-[900px]:flex-[1_0_0] min-[900px]:justify-end">
                <div className="content-stretch relative flex w-[180px] shrink-0 flex-col items-start gap-[32px]">
                  <p className={mutedClass}>Community</p>
                  <a href={DISCORD_INVITE_URL} target="_blank" rel="nofollow noopener noreferrer" className={linkClass}>
                    Join our Discord
                  </a>
                </div>
                <div className="relative flex w-[180px] shrink-0 flex-col items-start gap-[32px] whitespace-nowrap font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[14px] font-medium leading-[24px]">
                  <p className={cn("relative shrink-0 text-[15px]", isLightGray ? "text-[#1d1d1d]/50" : "text-[var(--text-icon-text-icon03)]")}>
                    Legal
                  </p>
                  <div className="content-stretch relative flex flex-col items-start gap-[20px] text-center">
                    <a href="/privacy-policy" className={linkClass}>
                      Privacy Policy
                    </a>
                    <a href="/terms-service" className={linkClass}>
                      Terms of Services
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
