import { format } from "date-fns";
import { OrderWithItemsT } from "@/types/order";
import { Modal } from "@/features/ui/modal/Modal";
import { OrderItemsList } from "../OrderItemsList";
import { OrderSummarySection } from "./OrderSummarySection";
import { CustomerInfoSection } from "./CustomerInfoSection";
import { TrackingInfoSection } from "./TrackingInfoSection";

interface PropsI {
  order: OrderWithItemsT | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: PropsI) {
  if (!order) return null;

  const formattedDate = format(
    new Date(order.created_at || 0),
    "MMMM dd, yyyy 'at' h:mm a",
  );
  const shippedDate = order.shipped_at
    ? format(new Date(order.shipped_at), "MMMM dd, yyyy")
    : null;
  const deliveredDate = order.delivered_at
    ? format(new Date(order.delivered_at), "MMMM dd, yyyy")
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Protocol ${order.order_number || order.id.slice(0, 8)}`}
      description={`Order details for ${order.order_number}`}
      className="md:max-w-5xl max-h-[90vh] overflow-y-auto border border-ink/10 bg-white"
    >
      <div className="space-y-8">
        <OrderSummarySection order={order} formattedDate={formattedDate} />

        <CustomerInfoSection order={order} />

        <section>
          <OrderItemsList items={order.order_items || []} isLoading={false} />
        </section>

        <TrackingInfoSection
          order={order}
          shippedDate={shippedDate}
          deliveredDate={deliveredDate}
        />
      </div>
    </Modal>
  );
}
