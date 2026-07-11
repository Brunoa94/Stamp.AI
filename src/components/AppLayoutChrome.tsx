"use client";

import { usePathname } from "next/navigation";
import { BrutalistFooter } from "@/features/layout/brutalist/BrutalistFooter";
import { StampHeader } from "@/features/stamp/ui/components/StampHeader";

interface AppLayoutChromeProps {
  children: React.ReactNode;
}

export function AppLayoutChrome({ children }: AppLayoutChromeProps) {
  const pathname = usePathname();
  const isStampRoute = pathname === "/stamp" || pathname.startsWith("/stamp/");

  return (
    <>
      <StampHeader />
      <main className="min-h-screen">{children}</main>
      {!isStampRoute && <BrutalistFooter />}
    </>
  );
}
