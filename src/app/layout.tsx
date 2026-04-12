import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Bungee,
  Bebas_Neue,
  Poppins,
} from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import Navbar from "@/features/layout/navbar";
import Footer from "@/features/layout/footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MainContent } from "@/components/MainContent";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { FluidInkDriftBackground } from "@/features/ui/fluid-ink-drift-background";

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
    <html
      lang="en"
      className="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
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
        className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} ${poppins.variable} ${bebasNeue.variable} antialiased`}
      >
        <FluidInkDriftBackground />
        <ThemeProvider>
          <SupabaseAuthProvider>
            <QueryProvider>
              <ScrollToTop />
              <header className="sticky top-0 z-50">
                <Navbar />
              </header>
              <MainContent>{children}</MainContent>
              <Footer />
              <Toaster />
            </QueryProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
