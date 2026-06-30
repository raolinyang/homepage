"use client";

import Light from "@/light/Light";
import { mountLightHeroHeadHints } from "@/light/hero-firstscreen-videos";
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function MarketingPage() {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.setAttribute("data-light-preview", "");
    return mountLightHeroHeadHints();
  }, []);

  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const hadHtmlDark = htmlEl.classList.contains("dark");
    const hadBodyDark = bodyEl.classList.contains("dark");
    const resolvedMode = htmlEl.getAttribute("data-mode");

    htmlEl.setAttribute("data-light-preview", "");
    if (resolvedMode !== "dark") {
      htmlEl.classList.remove("dark");
      bodyEl.classList.remove("dark");
    }

    return () => {
      htmlEl.removeAttribute("data-light-preview");
      if (hadHtmlDark) htmlEl.classList.add("dark");
      if (hadBodyDark) bodyEl.classList.add("dark");
    };
  }, []);

  return (
    <div
      data-light-preview-root
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--viznow-canvas-bg, #ffffff)",
        color: "var(--viznow-canvas-fg, #111114)",
      }}
    >
      <a className="light-skip-to-main" href="#main-content">
        Skip to main content
      </a>
      <div id="container">
        <div
          className="tailwind"
          style={{
            width: "min(100%, 1440px)",
            maxWidth: 1440,
            minWidth: 0,
            marginLeft: "auto",
            marginRight: "auto",
            position: "relative",
            overflow: "visible",
          }}
        >
          <div
            id="fig-code-root"
            style={{
              height: "auto",
              minHeight: 0,
              overflow: "visible",
            }}
          >
            <Light staticExport />
          </div>
        </div>
      </div>
    </div>
  );
}
