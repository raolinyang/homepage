export const MARKETING_RETURN_TO_PARAM = "returnTo";
export const MARKETING_MOBILE_PC_DIALOG_PARAM = "mobilePcStudioDialog";

const MARKETING_RETURN_ORIGINS = new Set(["https://viznow.ai", "https://www.viznow.ai", "https://site.viznow.ai"]);
const LOCAL_MARKETING_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function isAllowedMarketingReturnUrl(url: URL): boolean {
  if (MARKETING_RETURN_ORIGINS.has(url.origin)) return true;
  return LOCAL_MARKETING_HOSTS.has(url.hostname);
}

export function buildSafeMarketingReturnUrl(returnTo: string): string | null {
  let url: URL;

  try {
    url = new URL(returnTo);
  } catch {
    return null;
  }

  if (!isAllowedMarketingReturnUrl(url)) return null;

  url.searchParams.delete(MARKETING_MOBILE_PC_DIALOG_PARAM);
  return url.toString();
}

export function buildMarketingMobilePcDialogReturnUrl(returnTo: string): string | null {
  const safeReturnTo = buildSafeMarketingReturnUrl(returnTo);
  if (!safeReturnTo) return null;

  const url = new URL(safeReturnTo);
  url.searchParams.set(MARKETING_MOBILE_PC_DIALOG_PARAM, "1");
  return url.toString();
}

export function resolveMobileMarketingReturn(search: string, referrer = ""): string | null {
  const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const explicitReturnTo = searchParams.get(MARKETING_RETURN_TO_PARAM);

  if (explicitReturnTo) {
    const explicitReturn = buildSafeMarketingReturnUrl(explicitReturnTo);
    if (explicitReturn) return explicitReturn;
  }

  if (!referrer) return null;
  return buildSafeMarketingReturnUrl(referrer);
}

export function shouldOpenMarketingMobilePcDialog(search: string): boolean {
  const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return searchParams.get(MARKETING_MOBILE_PC_DIALOG_PARAM) === "1";
}
