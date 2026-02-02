import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { theme, componentThemes } from "@/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  align?: "left" | "center";
  variant?: "default" | "gradient";
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  align = "center",
  variant = "gradient",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-12 mt-4 space-y-4", className)}>
      <div className="flex items-start gap-4">
        {Icon && <Icon className="w-12 h-12 text-purple-600" />}
        <h1 className={theme.dashboard.title}>{title}</h1>
      </div>
      <p className={theme.dashboard.subtitle}>{subtitle}</p>
    </header>
  );
}
