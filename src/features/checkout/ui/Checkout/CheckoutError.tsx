import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/features/ui/alert";
import { Button } from "@/features/ui/button";

interface CheckoutErrorProps {
  error: Error;
}

/**
 * CheckoutError - Error state for checkout page
 * Shows user-friendly error message with action to return to dashboard
 */
export function CheckoutError({ error }: CheckoutErrorProps) {
  const handleReturnToDashboard = () => {
    window.location.href = "/stamp";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Alert variant="destructive" className="glass-card">
          <AlertCircle />
          <AlertTitle>Failed to Load Order</AlertTitle>
          <AlertDescription>
            <p className="mb-4">{error.message}</p>
            <Button
              onClick={handleReturnToDashboard}
              variant="destructive"
            >
              Return to Dashboard
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
