import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type WorkflowStepConfig = {
  step: string;
  title: string;
  body: string;
};

const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    step: "STEP 01",
    title: "IDEATION & SCRIPTING",
    body: "Scan trending narratives and leverage our AI co-pilot to instantly structure high-potential video outlines and scripts.",
  },
  {
    step: "STEP 02",
    title: "SEMANTIC BLUEPRINT",
    body: "Automatically map your script into a structural blueprint, matching every narrative beat with dynamic charts and assets.",
  },
  {
    step: "STEP 03",
    title: "ORCHESTRATION",
    body: "Command your premium visual assets using natural language to adjust compositions and scenes without keyframes.",
  },
  {
    step: "STEP 04",
    title: "SYNTHESIS",
    body: "Toggle between real-footage capture and AI narration to synthesize studio-grade, high-retention videos in seconds.",
  },
];

const WORKFLOW_BREATHE_MS = 2400;
const WORKFLOW_ENTER_MS = 560;
const WORKFLOW_ENTER_STAGGER_MS = 100;

function WorkflowStepInteractionStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-light-workflow-step]{
  opacity:0;
  transform:translateY(28px);
  box-shadow:0px 2px 12px 0px rgba(0,0,0,0.04);
}
[data-light-workflow-grid][data-entered] [data-light-workflow-step]{
  animation:lightWorkflowStepEnter ${WORKFLOW_ENTER_MS}ms cubic-bezier(0.22,1,0.36,1) forwards;
}
[data-light-workflow-grid][data-entered] [data-light-workflow-step]:nth-child(1){animation-delay:0ms;}
[data-light-workflow-grid][data-entered] [data-light-workflow-step]:nth-child(2){animation-delay:${WORKFLOW_ENTER_STAGGER_MS}ms;}
[data-light-workflow-grid][data-entered] [data-light-workflow-step]:nth-child(3){animation-delay:${WORKFLOW_ENTER_STAGGER_MS * 2}ms;}
[data-light-workflow-grid][data-entered] [data-light-workflow-step]:nth-child(4){animation-delay:${WORKFLOW_ENTER_STAGGER_MS * 3}ms;}
@keyframes lightWorkflowStepEnter{
  from{opacity:0;transform:translateY(28px);}
  to{opacity:1;transform:translateY(0) scale(1);}
}
@keyframes lightWorkflowStepBreathe{
  0%,100%{
    transform:scale(1);
    box-shadow:0px 2px 12px 0px rgba(0,0,0,0.04);
  }
  50%{
    transform:scale(1.022);
    box-shadow:0px 20px 40px -14px rgba(0,0,0,0.12);
  }
}
[data-light-workflow-step]:hover{
  z-index:10;
  animation:lightWorkflowStepBreathe ${WORKFLOW_BREATHE_MS}ms ease-in-out infinite;
  will-change:transform,box-shadow;
}
@media (prefers-reduced-motion:reduce){
  [data-light-workflow-grid][data-entered] [data-light-workflow-step]{
    animation:none!important;
    opacity:1!important;
    transform:none!important;
  }
  [data-light-workflow-step]:hover{
    animation:none!important;
    transform:none!important;
    box-shadow:0px 12px 28px -12px rgba(0,0,0,0.1)!important;
  }
}`,
      }}
    />
  );
}

function WorkflowStepCard({ step, title, body }: WorkflowStepConfig) {
  return (
    <article
      data-light-workflow-step=""
      className={cn(
        "relative z-0 flex min-h-[280px] flex-col rounded-[16px] bg-[#f4f4f5] p-6",
        "cursor-default shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]",
      )}
    >
      <div className="inline-flex w-fit shrink-0 items-center rounded-[8px] border border-[#d6d7db] bg-white px-3 py-1.5">
        <span className="font-['Poppins:Medium',sans-serif] text-[12px] font-medium leading-none tracking-[0.04em] text-[#111114]">
          {step}
        </span>
      </div>
      <div className="my-5 h-px w-full shrink-0 bg-[#d6d7db]/80" aria-hidden />
      <div className="flex flex-col gap-3">
        <h3 className="m-0 font-['Poppins:Medium',sans-serif] text-[14px] font-medium leading-[1.3] tracking-[0.02em] text-[#111114]">
          {title}
        </h3>
        <p className="m-0 font-['Plus_Jakarta_Sans:Regular',sans-serif] text-[14px] font-normal leading-[1.55] text-[#1d1d1d]/60">
          {body}
        </p>
      </div>
    </article>
  );
}

function StudioWorkflowHeader() {
  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-8 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between min-[900px]:gap-10">
      <div className="flex min-w-0 flex-[1_1_0] flex-col gap-[10px]">
        <p className="m-0 font-['Poppins:Regular',sans-serif] text-[14px] leading-normal text-[#1d1d1d]/80">
          YOUR STUDIO WORKFLOW
        </p>
        <h2
          id="light-heading-product"
          className="m-0 font-['Questrial:Regular',sans-serif] text-[40px] font-normal leading-[1.12] text-[#1d1d1d] min-[640px]:text-[48px] min-[900px]:text-[50px]"
        >
          <span className="block">From Blank Page To Final Frame.</span>
          <span className="block">Four Steps.</span>
        </h2>
      </div>
      <p className="m-0 max-w-[420px] shrink-0 font-['Poppins:Regular',sans-serif] text-[16px] leading-[1.5] text-[#1d1d1d]/60 min-[900px]:pb-[6px]">
        Master every stage of production, from intelligent topic ideation to authoritative visual execution.
      </p>
    </div>
  );
}

function isWorkflowRectReadyForEntrance(rect: DOMRectReadOnly, viewportH: number): boolean {
  if (rect.height > viewportH) {
    return rect.top <= viewportH * 0.72 && rect.bottom >= viewportH * 0.18;
  }
  return rect.top <= viewportH * 0.92 && rect.bottom >= viewportH * 0.08;
}

function isWorkflowFloorReadyForEntrance(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) return false;
  const viewportH = entry.rootBounds?.height ?? window.innerHeight;
  return isWorkflowRectReadyForEntrance(entry.boundingClientRect, viewportH);
}

/** `/light` — four-step studio workflow (replaces "Your Ideas In. Polished Videos Out."). */
export function LightStudioWorkflowSection() {
  const [cardsEntered, setCardsEntered] = useState(false);
  const entrancePlayedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  const playEntrance = useCallback(() => {
    if (entrancePlayedRef.current) return;
    entrancePlayedRef.current = true;
    setCardsEntered(true);
  }, []);

  const handleSectionMouseEnter = useCallback(() => {
    playEntrance();
  }, [playEntrance]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      playEntrance();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && isWorkflowFloorReadyForEntrance(entry)) playEntrance();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    observer.observe(el);

    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight;
    if (isWorkflowRectReadyForEntrance(rect, viewportH)) {
      playEntrance();
    }

    return () => observer.disconnect();
  }, [playEntrance]);

  return (
    <section
      ref={sectionRef}
      data-light-floor
      data-light-workflow-floor=""
      className="relative flex w-full flex-col items-center gap-[48px] bg-white px-5 py-[64px] min-[900px]:gap-[60px] min-[900px]:py-[80px]"
      aria-labelledby="light-heading-product"
      onMouseEnter={handleSectionMouseEnter}
    >
      <WorkflowStepInteractionStyles />
      <StudioWorkflowHeader />
      <div
        data-light-workflow-grid=""
        data-entered={cardsEntered ? "" : undefined}
        className="grid w-full max-w-[1200px] grid-cols-1 gap-5 min-[900px]:grid-cols-4 min-[900px]:gap-6"
      >
        {WORKFLOW_STEPS.map((step) => (
          <WorkflowStepCard key={step.step} {...step} />
        ))}
      </div>
    </section>
  );
}
