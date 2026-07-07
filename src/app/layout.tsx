import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Poppins, Anton, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./globals_v2.css";

import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { GrainOverlay } from "@/features/layout/brutalist/GrainOverlay";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppLayoutChrome } from "@/components/AppLayoutChrome";

/**
 * The design system allows exactly four font families:
 * - Anton + Bebas Neue for headings (HeadingPrimary combines both)
 * - Space Grotesk for paragraphs
 * - Poppins for spans/labels and default body text
 */

// Span/label + body font (Poppins for clean, modern body text)
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

export const metadata: Metadata = {
  title: "Imaginary Builder AI",
  description: "AI-powered design and building platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light scheme-light" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${bebasNeue.variable} ${anton.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <GrainOverlay />
        <ThemeProvider>
          <SupabaseAuthProvider>
            <QueryProvider>
              <ScrollToTop />
              <AppLayoutChrome>{children}</AppLayoutChrome>
              <Toaster />
            </QueryProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
