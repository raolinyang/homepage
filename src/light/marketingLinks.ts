import { env, type AppEnv } from "@/config/env";
import { APP_MOBILE_SIGN_IN_PATH } from "@/lib/links";
import { MARKETING_RETURN_TO_PARAM, buildSafeMarketingReturnUrl } from "@/lib/mobileMarketingReturn";

const MARKETING_PROD_APP_ORIGIN = "https://app.viznow.ai";
const MARKETING_PRE_APP_ORIGIN = "https://app-pre.viznow.ai";

export function resolveMarketingAppOrigin(appEnv: AppEnv = env.appEnv): string {
  return appEnv === "prod" ? MARKETING_PROD_APP_ORIGIN : MARKETING_PRE_APP_ORIGIN;
}

export function buildMarketingAppSignInUrl(appOrigin = resolveMarketingAppOrigin()): string {
  return `${appOrigin}?autoLogin=true`;
}

export function buildMarketingMobileSignInUrl(appOrigin = resolveMarketingAppOrigin(), returnTo?: string): string {
  const url = new URL(`${appOrigin}${APP_MOBILE_SIGN_IN_PATH}`);
  const safeReturnTo = returnTo ? buildSafeMarketingReturnUrl(returnTo) : null;

  if (safeReturnTo) {
    url.searchParams.set(MARKETING_RETURN_TO_PARAM, safeReturnTo);
  }

  return url.toString();
}

export const MARKETING_APP_SIGN_IN_URL = buildMarketingAppSignInUrl();
export const MARKETING_MOBILE_SIGN_IN_URL = buildMarketingMobileSignInUrl();
