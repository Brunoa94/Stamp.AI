import { Button } from "@/features/ui/button";

interface OrderCardFooterProps {
  totalAmount: number | null | undefined;
  onViewDetails: (e: React.MouseEvent) => void;
}

export function OrderCardFooter({
  totalAmount,
  onViewDetails,
}: OrderCardFooterProps) {
  return (
    <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-purple-200 dark:border-purple-700 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total Amount
        </span>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          ${totalAmount?.toFixed(2) || "0.00"}
        </span>
      </div>

      <Button
        onClick={onViewDetails}
        variant="ghost"
        className="group/btn text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium"
      >
        View Details
        <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">
          →
        </span>
      </Button>
    </div>
  );
}
