"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { navbarTheme } from "@/theme/components";

interface Props {
  isPending: boolean;
  onSignOut: () => void;
}

export function MobileNavbarSidebarSignOut({ isPending, onSignOut }: Props) {
  return (
    <Button
      onClick={onSignOut}
      disabled={isPending}
      className={cn(
        navbarTheme.actions.signOutButton,
        "ml-0 w-full h-12 flex items-center justify-center gap-2 rounded-xl active:scale-[0.98] text-sm",
      )}
    >
      <LogOut className="w-4 h-4" />
      {isPending ? "Signing out…" : "Sign Out"}
    </Button>
  );
}
