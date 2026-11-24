import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Poppins, Sanchez, Indie_Flower, Inter } from "next/font/google";
import "./globals.css";
import "./globals-stamp.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { toLanguageTag } from "@/i18n/locales";
import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { GuestCartMerger } from "@/features/auth/ui/components/GuestCartMerger";
import { QueryProvider } from "@/providers/QueryProvider";
import { StructuredData } from "@/features/seo/StructuredData";
import { organizationSchema } from "@/features/seo/schemas/organization";
import { webSiteSchema } from "@/features/seo/schemas/website";
import { generateRootMetadata } from "@/features/seo/metadata/rootMetadata";
import { BRAND_COLORS } from "@/features/seo/config/site";
import { ScrollToTop } from "@/shared/ui/ScrollToTop";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppLayoutChrome } from "./AppLayoutChrome";
import { GoogleAnalytics } from "@/features/analytics/GoogleAnalytics";
import { AnalyticsPageViewTracker } from "@/features/analytics/AnalyticsPageViewTracker";
import { CookieConsentBanner } from "@/features/analytics/ui/CookieConsentBanner";
import { GlobalErrorBoundary } from "@/shared/ui/ErrorBoundary/GlobalErrorBoundary";
import { WebVitalsReporter } from "@/shared/ui/WebVitalsReporter";

// Sanchez (headings), Inter (body) and Indie Flower (handwritten accent words)
// are preloaded: they render above the fold. Poppins is only a fallback behind
// Inter and Bebas Neue appears on a few interior screens, so they load on
// demand instead of competing with the hero for bandwidth.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const sanchez = Sanchez({
  variable: "--font-sanchez",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: true,
});

const indieFlower = Indie_Flower({
  variable: "--font-indie-flower",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = generateRootMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_COLORS.themeLight },
    { media: "(prefers-color-scheme: dark)", color: BRAND_COLORS.themeDark },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale} className="light scheme-light" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${bebasNeue.variable} ${sanchez.variable} ${indieFlower.variable} ${inter.variable} antialiased`}
      >
        {/* The acceptance suite runs against `next dev`, whose error badge grows
            over the bottom-left of the page once any error is logged and
            swallows clicks meant for the controls underneath. */}
        {process.env.NEXT_PUBLIC_STAMP_ACCEPTANCE_TESTS === "1" && (
          <style>{"nextjs-portal { display: none !important; }"}</style>
        )}
        <GoogleAnalytics />
        <AnalyticsPageViewTracker />
        <StructuredData data={organizationSchema()} />
        <StructuredData data={webSiteSchema(toLanguageTag(locale))} />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <WebVitalsReporter />
            <GlobalErrorBoundary>
              <SupabaseAuthProvider>
                <QueryProvider>
                  <GuestCartMerger />
                  <ScrollToTop />
                  <AppLayoutChrome>{children}</AppLayoutChrome>
                  <CookieConsentBanner />
                  <Toaster
                    position="bottom-right"
                    offset={24}
                    gap={12}
                    toastOptions={{
                      unstyled: true,
                      classNames: { success: "!pointer-events-none" },
                    }}
                  />
                </QueryProvider>
              </SupabaseAuthProvider>
            </GlobalErrorBoundary>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
