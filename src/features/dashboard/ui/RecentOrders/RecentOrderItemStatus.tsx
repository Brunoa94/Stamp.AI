import { Span } from "@/features/ui/span";
import { getDashboardStatusColor } from "../../styles/dashboardDesignTokens";

interface PropsI {
  status: string | null | undefined;
}

export function RecentOrderItemStatus({ status }: PropsI) {
  const statusColors = getDashboardStatusColor(status || "pending");

  return (
    <Span
      variant="micro"
      className={`px-3 py-1.5 border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
    >
      {status?.toUpperCase() || "PENDING"}
    </Span>
  );
}
