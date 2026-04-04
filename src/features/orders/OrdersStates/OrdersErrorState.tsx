import { AlertTriangle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme";

interface Props {
  error: Error | null;
  onRetry: () => void;
}

export function OrdersErrorState({ error, onRetry }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-red-800">Failed to Load Orders</h3>
        <p className="text-red-600">
          {error?.message || "An error occurred while fetching your orders. Please try again."}
        </p>
        <Button
          onClick={onRetry}
          className={componentThemes.button.primary}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
