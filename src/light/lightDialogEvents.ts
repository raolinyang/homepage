export const OPEN_LIGHT_MOBILE_PC_STUDIO_DIALOG_EVENT = "viznow:open-light-mobile-pc-studio-dialog";

export function openLightMobilePcStudioDialog() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LIGHT_MOBILE_PC_STUDIO_DIALOG_EVENT));
}
