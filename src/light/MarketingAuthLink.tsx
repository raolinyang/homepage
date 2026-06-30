import { resolveStaticUrl } from "@/config/env";
import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { MARKETING_APP_SIGN_IN_URL, buildMarketingMobileSignInUrl } from "./marketingLinks";

type MarketingAuthLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  desktopClassName?: string;
  mobileClassName?: string;
  desktopDisplayClassName?: string;
  mobileDisplayClassName?: string;
};

function withNoFollow(rel: string | undefined): string {
  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("nofollow");
  return Array.from(tokens).join(" ");
}

function getCurrentMarketingReturnTo(): string | undefined {
  return typeof window === "undefined" ? resolveStaticUrl("/") : window.location.href;
}

export function MarketingAuthLink({
  children,
  className,
  desktopClassName,
  mobileClassName,
  desktopDisplayClassName = "hidden min-[768px]:inline-flex",
  mobileDisplayClassName = "inline-flex min-[768px]:hidden",
  rel,
  ...props
}: MarketingAuthLinkProps) {
  const mobileSignInHref = buildMarketingMobileSignInUrl(undefined, getCurrentMarketingReturnTo());
  const desktopLinkClassName = cn(className, desktopClassName, desktopDisplayClassName);
  const mobileLinkClassName = cn(className, mobileClassName, mobileDisplayClassName);
  const linkRel = withNoFollow(rel);

  return (
    <>
      <a
        href={MARKETING_APP_SIGN_IN_URL}
        rel={linkRel}
        className={desktopLinkClassName}
        {...props}
      >
        {children}
      </a>
      <a
        href={mobileSignInHref}
        rel={linkRel}
        className={mobileLinkClassName}
        {...props}
      >
        {children}
      </a>
    </>
  );
}
