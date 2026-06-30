import { env } from "@/config/env";

/** 社群 Discord 邀请链接 */
export const DISCORD_INVITE_URL = "https://discord.com/invite/K2EREBJNjd";

/** Light / marketing Sign In — dev → app-pre, prod → app */
export const APP_SIGN_IN_URL = env.isDev
  ? "https://app-pre.viznow.ai?autoLogin=true"
  : "https://app.viznow.ai?autoLogin=true";

/** Mobile marketing Sign In route hosted by the app shell */
export const APP_MOBILE_SIGN_IN_PATH = "/mobile/sign-in";

/** Canonical production mobile Sign In page */
export const APP_PRODUCTION_MOBILE_SIGN_IN_URL = `https://app.viznow.ai${APP_MOBILE_SIGN_IN_PATH}`;

/** Absolute mobile marketing Sign In URL — dev → app-pre, prod → app */
export const APP_MOBILE_SIGN_IN_URL = env.isDev
  ? `https://app-pre.viznow.ai${APP_MOBILE_SIGN_IN_PATH}`
  : `https://app.viznow.ai${APP_MOBILE_SIGN_IN_PATH}`;

export function getMarketingSignInHref(target: "mobile" | "desktop"): string {
  return target === "mobile" ? APP_MOBILE_SIGN_IN_PATH : APP_SIGN_IN_URL;
}

/** 打开 Discord 社群页面（新标签页） */
export function openDiscordCommunity(): void {
  window.open(DISCORD_INVITE_URL, "_blank");
}
