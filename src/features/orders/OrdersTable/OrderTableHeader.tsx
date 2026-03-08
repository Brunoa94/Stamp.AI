import { ordersTheme } from "@/theme/components";
import { TableHead, TableHeader, TableRow } from "@/features/ui/table";

export function OrderTableHeader() {
  return (
    <TableHeader className={ordersTheme.table.thead}>
      <TableRow>
        <TableHead className={ordersTheme.table.th}>Order Details</TableHead>
        <TableHead className={ordersTheme.table.th}>Items</TableHead>
        <TableHead className={ordersTheme.table.th}>Status</TableHead>
        <TableHead className={ordersTheme.table.thRight}>Total</TableHead>
        <TableHead className={ordersTheme.table.thRight}>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
