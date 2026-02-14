import { Button } from "@/features/ui/button";
import { theme } from "@/theme";
import clsx from "clsx";

interface StampItButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function StampItButton({
  onClick,
  isLoading = false,
  disabled = false,
}: StampItButtonProps) {
  return (
    <div className="flex justify-center mt-8">
      <Button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={clsx(
          theme.button.submit.base,
          theme.button.submit.enabled,
          "px-12 animate-pulse"
        )}
      >
        {isLoading ? "Creating..." : "Stamp it! 🎨"}
      </Button>
    </div>
  );
}
