import { LIGHT_GRAY_FULL_BLEED_STYLE } from "./light-floor-layout";
import { MarketingAuthLink } from "./MarketingAuthLink";

function CtaArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="size-[18px] shrink-0" aria-hidden>
      <path
        d="M4 9H14M14 9L10 5M14 9L10 13"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** `/light` — bottom CTA (replaces "Stop spending hours on post-production"). */
export function LightCtaSection() {
  return (
    <section
      data-light-floor
      className="relative box-border flex w-full flex-col items-center bg-[#f4f4f5] px-5 py-[64px] min-[900px]:py-[80px]"
      style={LIGHT_GRAY_FULL_BLEED_STYLE}
      aria-labelledby="light-heading-cta"
    >
      <div className="flex w-full max-w-[760px] flex-col items-center gap-6 text-center">
        <p className="m-0 font-['Poppins:Regular',sans-serif] text-[14px] leading-normal text-[#1d1d1d]/80">
          THE STUDIO IS READY. ARE YOU ?
        </p>
        <h2
          id="light-heading-cta"
          className="m-0 font-['Questrial:Regular',sans-serif] text-[40px] font-normal leading-[1.12] text-[#1d1d1d] min-[640px]:text-[48px] min-[900px]:text-[56px]"
        >
          Stop Editing. Start Directing.
        </h2>
        <p className="m-0 font-['Poppins:Regular',sans-serif] text-[16px] leading-[1.5] text-[#1d1d1d]/60">
          Join 10,000+ knowledge creators upgrading from creator to studio, and orchestrate your next visual masterpiece
          today.
        </p>
        <MarketingAuthLink
          className="mt-2 inline-flex h-[44px] shrink-0 items-center justify-center gap-2 rounded-[39px] bg-[#2466ff] px-6 pl-7 pr-5 text-[15px] text-white no-underline shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-90"
        >
          <span className="font-['Poppins:Regular',sans-serif] leading-[1.5] whitespace-nowrap">
            Start Directing — It&apos;s Free
          </span>
          <CtaArrowIcon />
        </MarketingAuthLink>
      </div>
    </section>
  );
}
