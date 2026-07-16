"use client";

import { LayoutDashboard, Package, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { NavItem } from "../NavItem";
import { Button } from "@/features/ui/button";

interface MobileNavbarSidebarNavigationProps {
  pathname: string;
  onNavigate: (href: string) => void;
}

export function MobileNavbarSidebarNavigation({
  pathname,
  onNavigate,
}: MobileNavbarSidebarNavigationProps) {
  const t = useTranslations("layout.mobileSidebar");

  return (
    <>
      <div className="space-y-2 [&>button]:w-full [&>button]:justify-start [&>button]:rounded-xl [&>button]:py-4 [&>button]:px-4 [&>button]:font-heading [&>button]:tracking-wide [&>button]:uppercase">
        <NavItem
          label={t("dashboard")}
          icon={LayoutDashboard}
          isActive={pathname === "/dashboard"}
          onClick={() => onNavigate("/dashboard")}
        />

        <NavItem
          label={t("myOrders")}
          icon={Package}
          isActive={pathname === "/orders"}
          onClick={() => onNavigate("/orders")}
        />
      </div>

      <div className="h-px bg-slate-100 dark:bg-gray-800 my-6" />

      <Button
        variant="ghost"
        onClick={() => onNavigate("/profile")}
        className="w-full flex items-center justify-start gap-4 py-4 px-4 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
      >
        <User className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{t("viewProfile")}</span>
      </Button>
    </>
  );
}
