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
  showAvatarWhenAuthenticated?: boolean;
};

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
  showAvatarWhenAuthenticated: _showAvatarWhenAuthenticated = false,
  ...props
}: MarketingAuthLinkProps) {
  const mobileSignInHref = buildMarketingMobileSignInUrl(undefined, getCurrentMarketingReturnTo());
  const desktopLinkClassName = cn(className, desktopClassName, desktopDisplayClassName);
  const mobileLinkClassName = cn(className, mobileClassName, mobileDisplayClassName);

  return (
    <>
      <a
        href={MARKETING_APP_SIGN_IN_URL}
        className={desktopLinkClassName}
        {...props}
      >
        {children}
      </a>
      <a
        href={mobileSignInHref}
        className={mobileLinkClassName}
        {...props}
      >
        {children}
      </a>
    </>
  );
}
