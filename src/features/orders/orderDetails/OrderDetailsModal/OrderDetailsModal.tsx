import { OrderWithItemsT } from "@/types/order";
import { Modal } from "@/features/ui/modal/Modal";
import { OrderItemsList } from "../OrderItemsList";
import { OrderSummarySection } from "./OrderSummarySection";
import { CustomerInfoSection } from "./CustomerInfoSection";
import { TrackingInfoSection } from "./TrackingInfoSection";
import { format } from "date-fns";

interface Props {
  order: OrderWithItemsT | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: Props) {
  if (!order) return null;

  const formattedDate = format(new Date(order.created_at || 0), "MMMM dd, yyyy 'at' h:mm a");
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
      title={`Order #${order.order_number}`}
      description={`Order details for ${order.order_number}`}
      className="md:max-w-4xl max-h-[85vh] overflow-y-auto"
    >
      <div className="space-y-6">
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
