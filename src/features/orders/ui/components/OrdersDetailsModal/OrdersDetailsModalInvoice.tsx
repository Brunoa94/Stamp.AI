import { FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { useInvoiceDownload } from "@/features/orders/lib/hooks/useInvoiceDownload";
import type { OrderWithItemsT } from "@/types/order";

interface PropsI {
  order: OrderWithItemsT;
}

/**
 * Invoice download action shown in the order details modal.
 * Only rendered for paid orders. The generate-invoice edge function is
 * idempotent, so the button works both when the invoice already exists
 * (webhook-generated) and when it still needs to be issued.
 */
export function OrdersDetailsModalInvoice({ order }: PropsI) {
  const t = useTranslations("orders.detailsModal.invoice");
  const isPaid = order.payment_status === "paid";
  const { isLoading, invoiceNumber, handleDownload } = useInvoiceDownload({
    orderId: order.id,
    isPaid,
  });

  if (!isPaid) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-(--color-stamp-divider) pt-4">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant="ghost"
        className="h-auto w-full justify-center gap-2 border-2 border-(--color-stamp-divider) px-4 py-3 font-semibold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:bg-(--color-stamp-cream)/60 hover:border-(--color-stamp-chocolate) hover:shadow-md"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isLoading ? t("preparing") : t("download")}
      </Button>
      {invoiceNumber ? (
        <Paragraph
          variant="sm"
          className="mt-2 text-center text-[9px] tracking-[0.2em] text-(--color-stamp-taupe)"
        >
          {invoiceNumber}
        </Paragraph>
      ) : null}
    </div>
  );
}
