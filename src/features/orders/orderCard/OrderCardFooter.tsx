import { Button } from "@/features/ui/button";
import { Mail } from "lucide-react";

interface OrderCardFooterProps {
  totalAmount: number | null | undefined;
  onViewDetails: (e: React.MouseEvent) => void;
  orderNumber: string;
}

export function OrderCardFooter({
  totalAmount,
  onViewDetails,
  orderNumber,
}: OrderCardFooterProps) {
  const handleReportIssue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const subject = `Report Issue [${orderNumber}]`;
    const mailtoLink = `mailto:customers@stampai.com?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total Amount
        </span>
        <span className="text-xl font-bold bg-linear-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
          ${totalAmount?.toFixed(2) || "0.00"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleReportIssue}
          variant="outline"
          size="sm"
          className="border-gray-300 dark:border-gray-700 text-slate-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-900/20"
        >
          <Mail className="h-4 w-4" />
          Report Issue
        </Button>

        <Button
          onClick={onViewDetails}
          variant="ghost"
          className="group/btn text-slate-700 hover:text-slate-800 hover:bg-gray-50 font-medium"
        >
          View Details
          <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">
            →
          </span>
        </Button>
      </div>
    </div>
  );
}
