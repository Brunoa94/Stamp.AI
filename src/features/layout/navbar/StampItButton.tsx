import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface StampItButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function StampItButton({ isActive, onClick }: StampItButtonProps) {
  const t = useTranslations("layout.navbar");

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "flex items-center gap-2 font-bold px-6 py-3 relative group transition-all duration-300",
        isActive &&
          "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 scale-110",
        !isActive && "hover:scale-110",
      )}
    >
      <Sparkles
        className={cn(
          "w-7 h-7 transition-transform duration-300",
          isActive
            ? "animate-pulse text-white"
            : "animate-[stamp-sparkle_2s_ease-in-out_infinite] text-purple-400 dark:text-purple-300",
        )}
      />
      <span
        className={cn(
          "text-lg font-heading font-bold tracking-wider uppercase",
          !isActive &&
            "bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 dark:from-purple-300 dark:via-pink-300 dark:to-purple-300 bg-clip-text text-transparent bg-size-[200%_auto] animate-[stamp-gradient_3s_ease-in-out_infinite]",
        )}
        style={isActive ? {} : { backgroundSize: "200% auto" }}
      >
        {t("stampItButton")}
      </span>
      {isActive && <Sparkles className="w-7 h-7 animate-pulse text-white" />}
    </Button>
  );
}
