import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./marketing.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viznow.ai";
const pageTitle = "Viznow AI - World's First AI Visual Narrative Agent";
const pageDescription =
  "Transform static talking heads into viral hits. VizNow AI automatically adds B-roll & effects to boost retention. Don't just tell, viz it now. Try it free.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  authors: [{ name: "Viznow" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    url: siteUrl,
    images: [{ url: "/images/logo-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/images/logo-main.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" translate="no" className="notranslate" suppressHydrationWarning>
      <body translate="no" className="notranslate">
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
