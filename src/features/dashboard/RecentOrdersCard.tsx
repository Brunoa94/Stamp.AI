import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import type { OrderWithItemsT } from "@/types/order";

interface RecentOrdersCardProps {
  orders: OrderWithItemsT[];
}

function formatOrderTotal(amount?: number | null) {
  if (!amount && amount !== 0) return "$0.00";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStatusClass(status?: string | null) {
  const normalized = status?.toLowerCase() || "processing";
  if (normalized.includes("delivered")) {
    return dashboardTheme.orders.statusDelivered;
  }
  if (normalized.includes("shipped")) {
    return dashboardTheme.orders.statusShipped;
  }
  if (normalized.includes("cancel")) {
    return dashboardTheme.orders.statusCancelled;
  }
  return dashboardTheme.orders.statusProcessing;
}

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  const recentOrders = orders.slice(0, 3);

  return (
    <section className={dashboardTheme.orders.card}>
      <div className={dashboardTheme.orders.header}>
        <h4 className={dashboardTheme.card.sectionTitle}>Recent Orders</h4>
        <Link href="/orders" className={dashboardTheme.orders.viewAll}>
          View All
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className={dashboardTheme.orders.emptyState}>
          No recent orders yet. Start a new design to place your first order.
        </p>
      ) : (
        <div className="space-y-4">
          {recentOrders.map((order) => {
            const firstItem = order.order_items?.[0];
            const imageUrl = firstItem?.custom_image_url || "/placeholder.png";
            const statusClass = getStatusClass(order.status);

            return (
              <div key={order.id} className={dashboardTheme.orders.item}>
                <div className={dashboardTheme.orders.itemImageWrap}>
                  <img
                    src={imageUrl}
                    alt={firstItem?.product_name || "Order item"}
                    className={dashboardTheme.orders.itemImage}
                  />
                </div>
                <div className="grow">
                  <div className="flex justify-between mb-1">
                    <h5 className={dashboardTheme.orders.itemTitle}>
                      {firstItem?.product_name || "Custom Design"}
                    </h5>
                    <span
                      className={`${dashboardTheme.orders.statusBadge} ${statusClass}`}
                    >
                      {order.status || "Processing"}
                    </span>
                  </div>
                  <p className={dashboardTheme.orders.itemMeta}>
                    Order #{order.order_number}
                  </p>
                  <span className={dashboardTheme.orders.itemPrice}>
                    {formatOrderTotal(order.total_amount)}
                  </span>
                </div>
                <Link
                  href={`/orders?orderId=${order.id}`}
                  className="p-2 text-gray-400 hover:text-[#7C3AED]"
                  aria-label="View order details"
                >
                  <ChevronRight className="text-2xl" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
