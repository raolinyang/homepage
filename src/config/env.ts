import { z } from "zod";

export type AppEnv = "dev" | "devtest" | "test" | "prod";

function deriveAppEnvFromMode(mode: string): AppEnv {
  if (mode === "development") return "dev";
  if (mode === "devtest") return "devtest";
  if (mode === "test") return "test";
  return "prod";
}

function normalizeBaseUrl(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function readProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[key];
  return typeof value === "string" ? value : undefined;
}

const mode = readProcessEnv("NODE_ENV") ?? "production";
const derivedAppEnv = deriveAppEnvFromMode(mode);

const schema = z.object({
  APP_ENV: z.enum(["dev", "devtest", "test", "prod"]).catch(derivedAppEnv),
  API_BASE_URL: z.string().catch(""),
  API_PROXY_TARGET: z.string().catch(""),
  API_EXPORT_SERVICE_BASE_URL: z.string().catch(""),
  STATIC_BASE_URL: z.string().catch(""),
  MIXPANEL_TOKEN: z.string().catch(""),
});

const parsed = schema.parse({
  APP_ENV: readProcessEnv("NEXT_PUBLIC_APP_ENV"),
  API_BASE_URL: readProcessEnv("NEXT_PUBLIC_API_BASE_URL"),
  API_PROXY_TARGET: readProcessEnv("NEXT_PUBLIC_API_PROXY_TARGET"),
  API_EXPORT_SERVICE_BASE_URL: readProcessEnv("NEXT_PUBLIC_API_EXPORT_SERVICE_BASE_URL"),
  STATIC_BASE_URL: readProcessEnv("NEXT_PUBLIC_STATIC_BASE_URL"),
  MIXPANEL_TOKEN: readProcessEnv("NEXT_PUBLIC_MIXPANEL_TOKEN"),
});

export const env = {
  mode,
  appEnv: parsed.APP_ENV as AppEnv,
  apiBaseUrl: normalizeBaseUrl(parsed.API_BASE_URL),
  apiProxyTarget: parsed.API_PROXY_TARGET ? parsed.API_PROXY_TARGET.trim() : "",
  exportServiceBaseUrl: normalizeBaseUrl(parsed.API_EXPORT_SERVICE_BASE_URL),
  staticBaseUrl: normalizeBaseUrl(parsed.STATIC_BASE_URL),
  mixpanelToken: parsed.MIXPANEL_TOKEN,
  isDev: parsed.APP_ENV === "dev",
  isDevtest: parsed.APP_ENV === "devtest",
  isTest: parsed.APP_ENV === "test",
  isProd: parsed.APP_ENV === "prod",
  /**
   * 是否开放 /editor/mock、/chat/mock。
   * Next.js marketing entry does not mount those routes; this remains for legacy
   * source files that still import shared config.
   */
  isMockRoutesEnabled: mode === "development",
} as const;

/**
 * 将 API path 解析成可请求的完整 URL
 * Legacy app helpers only; the marketing-only Next.js entry should not call this.
 */
export function resolveApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (env.apiBaseUrl) {
    return `${env.apiBaseUrl}${normalizedPath}`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalizedPath}`;
  }

  return normalizedPath;
}

/**
 * 将 path 解析为导出服务完整 URL（导出服务无需用户校验，不携带 token）
 * Legacy app helpers only; the marketing-only Next.js entry should not call this.
 */
export function resolveExportServiceUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (env.exportServiceBaseUrl) {
    return `${env.exportServiceBaseUrl}${normalizedPath}`;
  }
  return resolveApiUrl(path);
}

/**
 * 将静态资源 path 拼接为完整 URL
 * - 若设置了 NEXT_PUBLIC_STATIC_BASE_URL：拼接为 `${staticBaseUrl}${path}`
 * - 否则：返回原始 path（走同域相对路径）
 *
 * @example resolveStaticUrl('/images/logo.png') => 'https://viznow.ai/images/logo.png' (prod)
 */
export function resolveStaticUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (env.staticBaseUrl) {
    return `${env.staticBaseUrl}${normalizedPath}`;
  }
  return normalizedPath;
}
