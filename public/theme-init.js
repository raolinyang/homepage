/**
 * Blocking first-paint theme: sets `data-mode` / `dark` on <html> before body paints.
 * Keep in sync with `src/lib/resolveAppColorMode.ts`.
 */
(function () {
  function isLightStaticPage(path) {
    return (
      path === "/light" ||
      path.endsWith("/light") ||
      path === "/" ||
      path === "/index.html" ||
      path.endsWith("/index.html")
    );
  }

  function applyAppColorMode() {
    var stored;
    try {
      stored = localStorage.getItem("app_theme");
    } catch (e) {
      stored = null;
    }
    var systemDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    var mode;
    if (stored === "dark") mode = "dark";
    else if (stored === "light") mode = "light";
    else mode = systemDark ? "dark" : "light";
    var root = document.documentElement;
    root.setAttribute("data-mode", mode);
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.style.colorScheme = mode;
    if (mode === "dark") {
      root.style.setProperty("--viznow-canvas-bg", "#111114");
      root.style.setProperty("--viznow-canvas-fg", "#ffffff");
    } else {
      root.style.setProperty("--viznow-canvas-bg", "#ffffff");
      root.style.setProperty("--viznow-canvas-fg", "#111114");
    }

    var path = typeof location !== "undefined" ? location.pathname : "";
    if (isLightStaticPage(path) || root.hasAttribute("data-light-preview")) {
      root.setAttribute("data-light-preview", "");
    }
  }

  applyAppColorMode();

  if (typeof window !== "undefined" && window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onSystemChange = function () {
      try {
        var stored = localStorage.getItem("app_theme");
        if (stored !== "light" && stored !== "dark") applyAppColorMode();
      } catch (e) {
        applyAppColorMode();
      }
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onSystemChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onSystemChange);
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", function (e) {
      if (e.key === "app_theme") applyAppColorMode();
    });
  }
})();
