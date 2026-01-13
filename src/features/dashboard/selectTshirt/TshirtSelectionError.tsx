import { Button } from "@/features/ui/button";
import { AlertTriangleIcon } from "@/theme";

interface Props {
  error: Error | null;
  onRetry?: () => void;
}

const TshirtSelectionError = ({ error, onRetry }: Props) => {
  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      role="alert"
    >
      <div className="mb-4">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Failed to Load Products
      </h3>
      <p className="text-red-700 mb-4">
        {error?.message || "An error occurred while fetching t-shirt products"}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="destructive"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default TshirtSelectionError;
