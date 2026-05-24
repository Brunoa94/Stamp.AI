"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/features/ui/button";

interface Props {
  isPending: boolean;
  onSignOut: () => void;
}

export function MobileNavbarSidebarSignOut({ isPending, onSignOut }: Props) {
  return (
    <Button
      onClick={onSignOut}
      disabled={isPending}
      variant="outline"
      className="w-full h-12 flex flex-row items-center justify-center gap-2 rounded-xl active:scale-[0.98] text-sm font-medium text-slate-600 hover:text-red-500 hover:border-red-200 dark:text-slate-300 dark:hover:text-red-400"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      <span>{isPending ? "Signing out…" : "Sign Out"}</span>
    </Button>
  );
}
