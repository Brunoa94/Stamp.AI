"use client";

import type { UserI } from "@/types/api";
import { Button } from "@/features/ui/button";

interface MobileNavbarSidebarProfileProps {
  user?: UserI | null;
  onOpenProfile: () => void;
}

const profileStyles = {
  button:
    "w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-800/60 mb-3",
  avatar:
    "w-10 h-10 rounded-full bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white flex items-center justify-center text-sm font-bold tracking-wider",
  name: "text-sm font-heading tracking-wide uppercase text-slate-900 dark:text-slate-100 truncate",
  email: "text-xs text-slate-500 dark:text-slate-400 truncate",
};

export function MobileNavbarSidebarProfile({
  user,
  onOpenProfile,
}: MobileNavbarSidebarProfileProps) {
  const firstName = user?.user_metadata?.first_name || "User";
  const lastName = user?.user_metadata?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const avatarInitials =
    `${firstName[0] || "U"}${lastName[0] || ""}`.toUpperCase();

  return (
    <Button
      variant="ghost"
      onClick={onOpenProfile}
      className={profileStyles.button}
    >
      <div className={profileStyles.avatar}>{avatarInitials}</div>
      <div className="flex flex-col text-left min-w-0">
        <span className={profileStyles.name}>{fullName}</span>
        <span className={profileStyles.email}>
          {user?.email || "View profile"}
        </span>
      </div>
    </Button>
  );
}
