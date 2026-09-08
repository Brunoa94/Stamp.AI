import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Poppins, Outfit, Sanchez, Indie_Flower, Inter } from "next/font/google";
import "./globals.css";
import "./globals-stamp.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { GrainOverlay } from "@/features/layout/brutalist/GrainOverlay";
import { StructuredData } from "@/features/seo/StructuredData";
import { organizationSchema } from "@/features/seo/schemas/organization";
import { webSiteSchema } from "@/features/seo/schemas/website";
import { generateRootMetadata } from "@/features/seo/metadata/rootMetadata";
import { BRAND_COLORS } from "@/features/seo/config/site";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppLayoutChrome } from "@/components/AppLayoutChrome";
import { GoogleAnalytics } from "@/features/analytics/GoogleAnalytics";
import { AnalyticsPageViewTracker } from "@/features/analytics/AnalyticsPageViewTracker";
import { GlobalErrorBoundary } from "@/components/ErrorBoundary/GlobalErrorBoundary";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
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
  const messages = await getMessages();

  return (
    <html lang="en" className="light scheme-light" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${bebasNeue.variable} ${outfit.variable} ${sanchez.variable} ${indieFlower.variable} ${inter.variable} antialiased`}
      >
        <GoogleAnalytics />
        <AnalyticsPageViewTracker />
        <StructuredData data={organizationSchema()} />
        <StructuredData data={webSiteSchema()} />
        <GrainOverlay />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <WebVitalsReporter />
            <GlobalErrorBoundary>
              <SupabaseAuthProvider>
                <QueryProvider>
                  <ScrollToTop />
                  <AppLayoutChrome>{children}</AppLayoutChrome>
                  <Toaster
                    position="bottom-right"
                    offset={24}
                    gap={12}
                    toastOptions={{
                      unstyled: true,
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
