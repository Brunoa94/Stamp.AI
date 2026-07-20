import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Poppins, Outfit } from "next/font/google";
import "./globals.css";
import "./globals-stamp.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { GrainOverlay } from "@/features/layout/brutalist/GrainOverlay";
import { StructuredData } from "@/features/seo/StructuredData";
import { organizationSchema } from "@/features/seo/jsonLd";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppLayoutChrome } from "@/components/AppLayoutChrome";

// Body font (Poppins for clean, modern body text)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Retro heading font (Bebas Neue for display text)
const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

// Primary heading font (Outfit for headings and UI text)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.metadata");
  return {
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords") as string[],
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        className={`${poppins.variable} ${bebasNeue.variable} ${outfit.variable} antialiased`}
      >
        <StructuredData data={organizationSchema()} />
        <GrainOverlay />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
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
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
