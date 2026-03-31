"use client";

import { usePathname } from "next/navigation";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <main
      className={
        isHomepage
          ? "w-full max-w-none mx-0 px-0 pt-0 min-h-dvh"
          : "w-full max-w-360 mx-auto px-6 md:px-16 xl:px-24 pt-8 lg:pt-10 min-h-screen"
      }
    >
      {children}
    </main>
  );
}
