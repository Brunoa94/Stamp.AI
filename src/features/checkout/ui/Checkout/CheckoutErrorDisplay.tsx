import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/features/ui/alert";
import { Button } from "@/features/ui/button";

interface CheckoutErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

/**
 * CheckoutErrorDisplay - Inline error message display
 * Used to show error messages within forms or sections with optional dismiss action
 */
export default function CheckoutErrorDisplay({
  error,
  onDismiss
}: CheckoutErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="flex items-start justify-between">
      <div className="flex items-start gap-2 flex-1">
        <AlertCircle className="mt-0.5" />
        <AlertDescription>
          <p className="text-sm">{error}</p>
        </AlertDescription>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="h-auto p-1 hover:bg-transparent"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </Alert>
  );
}
