import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Bungee,
  Bebas_Neue,
  Poppins,
  Anton,
  Space_Grotesk,
  Outfit,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import "./globals-stamp.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { GrainOverlay } from "@/features/layout/brutalist/GrainOverlay";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppLayoutChrome } from "@/components/AppLayoutChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bungee = Bungee({
  weight: "400",
  variable: "--font-bungee",
  subsets: ["latin"],
});

// Body font (Poppins for clean, modern body text)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Retro heading font (Bebas Neue for retro display text)
const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

// Brutalist display font (Anton for massive brutalist headings)
const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
});

// Brutalist body font (Space Grotesk for geometric sans-serif)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Stamp luxury fonts
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
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
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400,500,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&f[]=satoshi@700,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} ${poppins.variable} ${bebasNeue.variable} ${anton.variable} ${spaceGrotesk.variable} ${outfit.variable} ${playfairDisplay.variable} antialiased`}
      >
        <GrainOverlay />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <SupabaseAuthProvider>
              <QueryProvider>
                <ScrollToTop />
                <AppLayoutChrome>{children}</AppLayoutChrome>
                <Toaster />
              </QueryProvider>
            </SupabaseAuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
