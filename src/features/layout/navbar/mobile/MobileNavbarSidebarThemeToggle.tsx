"use client";

import { Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { navbarTheme } from "@/theme/components";

interface MobileNavbarSidebarThemeToggleProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function MobileNavbarSidebarThemeToggle({
  isDark,
  onToggleTheme,
}: MobileNavbarSidebarThemeToggleProps) {
  const t = useTranslations("layout.mobileSidebar");

  return (
    <Button
      variant="ghost"
      onClick={onToggleTheme}
      className={navbarTheme.mobileSidebar.themeToggle.button}
    >
      <div className="flex items-center gap-4">
        <Moon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{t("darkMode")}</span>
      </div>

      <div
        className={cn(navbarTheme.mobileSidebar.themeToggle.switchTrack, {
          "bg-[#7C3AED]": isDark,
          "bg-slate-200": !isDark,
        })}
      >
        <div
          className={cn(navbarTheme.mobileSidebar.themeToggle.switchThumb, {
            "left-6": isDark,
            "left-1": !isDark,
          })}
        />
      </div>
    </Button>
  );
}
