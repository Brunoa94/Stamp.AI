import { useCallback } from "react";
import { OrderWithItemsT } from "@/types/order";

export function useOrderInvoiceDownload(order: OrderWithItemsT) {
  const handleDownloadInvoice = useCallback(() => {
    const invoice = {
      orderNumber: order.order_number,
      orderId: order.id,
      customerEmail: order.customer_email,
      createdAt: order.created_at,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: order.subtotal,
      shipping: order.shipping_cost,
      tax: order.tax_amount,
      total: order.total_amount,
      currency: order.currency || "USD",
      items: order.order_items || [],
    };

    const blob = new Blob([JSON.stringify(invoice, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${order.order_number}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [order]);

  return { handleDownloadInvoice };
}
