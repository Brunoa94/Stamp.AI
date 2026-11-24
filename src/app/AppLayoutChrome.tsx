"use client";

import { usePathname } from "next/navigation";
import { StampFooter } from "@/features/stamp/ui/components/StampFooter/StampFooter";
import { StampHeader } from "@/features/stamp/ui/components/StampHeader/StampHeader";

interface PropsI {
  children: React.ReactNode;
}

export function AppLayoutChrome({ children }: PropsI) {
  const pathname = usePathname();
  const isStampRoute = pathname === "/stamp" || pathname.startsWith("/stamp/");

  return (
    <>
      <StampHeader />
      <main className="min-h-screen">{children}</main>
      {!isStampRoute && <StampFooter />}
    </>
  );
}
