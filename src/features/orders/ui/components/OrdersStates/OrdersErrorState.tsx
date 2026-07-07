import { AlertTriangle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

interface PropsI {
  error: Error | null;
  onRetry: () => void;
}

export function OrdersErrorState({ error, onRetry }: PropsI) {
  return (
    <div className="flex items-center justify-center min-h-100">
      <div className="bg-brandRed/5 border border-brandRed/20 rounded-2xl p-8 max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-brandRed" />
        </div>
        <Heading as="h3" variant="question" className="text-brandRed">
          Failed to Load Orders
        </Heading>
        <Paragraph as="p" className="text-brandRed/80">
          {error?.message ||
            "An error occurred while fetching your orders. Please try again."}
        </Paragraph>
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
}
