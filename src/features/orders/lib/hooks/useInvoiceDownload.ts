import { useState, useCallback } from "react";
import { useGenerateInvoice, useOrderInvoice } from "@/queries";
import { InvoiceService } from "@/services/invoiceService";

interface UseInvoiceDownloadOptions {
  orderId: string;
  isPaid: boolean;
}

interface UseInvoiceDownloadResult {
  isLoading: boolean;
  invoiceNumber: string | null;
  handleDownload: () => Promise<void>;
}

/**
 * Hook to handle invoice download logic with loading state.
 * Encapsulates the workflow of:
 * 1. Getting a signed URL if the invoice PDF already exists
 * 2. Generating the invoice via edge function if not
 * 3. Opening the download URL in a new tab
 */
export function useInvoiceDownload({
  orderId,
  isPaid,
}: UseInvoiceDownloadOptions): UseInvoiceDownloadResult {
  const { data: invoice } = useOrderInvoice(isPaid ? orderId : null);
  const generateInvoice = useGenerateInvoice();
  const [isGettingUrl, setIsGettingUrl] = useState(false);

  const handleDownload = useCallback(async () => {
    // Prefer a direct signed URL when the PDF already exists; otherwise
    // ask the edge function to issue the invoice and return a URL.
    let url: string | null = null;

    if (invoice?.pdf_path) {
      setIsGettingUrl(true);
      try {
        url = await InvoiceService.getInvoiceDownloadUrl(invoice);
      } finally {
        setIsGettingUrl(false);
      }
    }

    if (!url) {
      try {
        const result = await generateInvoice.mutateAsync(orderId);
        url = result.download_url;
      } catch {
        // Error already surfaced by the mutation's onError handler
        return;
      }
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [invoice, orderId, generateInvoice]);

  return {
    isLoading: generateInvoice.isPending || isGettingUrl,
    invoiceNumber: invoice?.invoice_number ?? null,
    handleDownload,
  };
}
