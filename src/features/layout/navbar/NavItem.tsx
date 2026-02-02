import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function NavItem({ label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "flex items-center gap-2 font-semibold px-4 py-2",
        isActive &&
          "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
        !isActive &&
          "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Button>
  );
}
