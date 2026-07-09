import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { useGenerateInvoice, useOrderInvoice } from "@/queries";
import { InvoiceService } from "@/services/invoiceService";
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
  const isPaid = order.payment_status === "paid";
  const { data: invoice } = useOrderInvoice(isPaid ? order.id : null);
  const generateInvoice = useGenerateInvoice();

  if (!isPaid) {
    return null;
  }

  const handleDownload = async () => {
    // Prefer a direct signed URL when the PDF already exists; otherwise
    // ask the edge function to issue the invoice and return a URL.
    let url: string | null = null;

    if (invoice?.pdf_path) {
      url = await InvoiceService.getInvoiceDownloadUrl(invoice);
    }

    if (!url) {
      try {
        const result = await generateInvoice.mutateAsync(order.id);
        url = result.download_url;
      } catch {
        // Error already surfaced by the mutation's onError handler
        return;
      }
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mt-6 border-t border-(--color-stamp-divider) pt-4">
      <Button
        onClick={handleDownload}
        disabled={generateInvoice.isPending}
        variant="ghost"
        className="h-auto w-full justify-center gap-2 rounded-none border border-(--color-stamp-divider) px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:bg-(--color-stamp-cream)/60 hover:text-(--color-stamp-chocolate)"
      >
        {generateInvoice.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {generateInvoice.isPending ? "Preparing Invoice…" : "Download Invoice"}
      </Button>
      {invoice?.invoice_number ? (
        <Paragraph
          variant="sm"
          className="mt-2 text-center text-[9px] tracking-[0.2em] text-(--color-stamp-taupe)"
        >
          {invoice.invoice_number}
        </Paragraph>
      ) : null}
    </div>
  );
}
