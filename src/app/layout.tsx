import type { Metadata } from "next";
import { Geist, Geist_Mono, Bungee } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/features/providers/SupabaseAuthProvider";
import { QueryProvider } from "@/features/providers/QueryProvider";
import { ThemeProvider } from "@/features/providers/ThemeProvider";
import Navbar from "@/features/layout/navbar";
import Footer from "@/features/layout/footer";
import { ScrollToTop } from "@/components/ScrollToTop";

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

export const metadata: Metadata = {
  title: "Imaginary Builder AI",
  description: "AI-powered design and building platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SupabaseAuthProvider>
            <QueryProvider>
              <ScrollToTop />
              <header>
                <Navbar />
              </header>
              <main className="pt-20 min-h-screen">{children}</main>
              <Footer />
              <Toaster />
            </QueryProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
