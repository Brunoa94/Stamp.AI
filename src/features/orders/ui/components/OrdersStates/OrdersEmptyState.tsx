import { ShoppingBag, Filter } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { useViewTransitionNavigate } from "@/features/ui/view-transition-link";

interface PropsI {
  variant?: "no-orders" | "no-match";
  onClearFilters?: () => void;
}

export function OrdersEmptyState({
  variant = "no-orders",
  onClearFilters,
}: PropsI) {
  const navigate = useViewTransitionNavigate();
  const isNoMatch = variant === "no-match";

  return (
    <div className="flex items-center justify-center min-h-100">
      <div className="bg-linear-to-br from-gray-50 via-slate-50 to-gray-100 border border-gray-200 rounded-2xl p-12 max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-linear-to-br from-slate-600 to-gray-700 p-6 rounded-full">
            {isNoMatch ? (
              <Filter className="w-12 h-12 text-white" />
            ) : (
              <ShoppingBag className="w-12 h-12 text-white" />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Heading as="h3" variant="card" className="text-gray-800">
            {isNoMatch ? "No Orders Match Your Filters" : "No Orders Yet"}
          </Heading>
          <Paragraph as="p" variant="body" className="text-gray-600">
            {isNoMatch
              ? "Try adjusting or clearing your filters to see more results."
              : "You haven't placed any orders yet. Start creating your custom designs and place your first order!"}
          </Paragraph>
        </div>
        {isNoMatch ? (
          <Button onClick={onClearFilters} variant="default">
            Clear Filters
          </Button>
        ) : (
          <Button onClick={() => navigate("/stamp")} variant="default">
            Start Creating
          </Button>
        )}
      </div>
    </div>
  );
}
