"use client";

import { OrderWithItemsT } from "@/types/order";
import { OrderItemsList } from "../OrderItemsList";
import { OrderSummarySection } from "./OrderSummarySection";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { useOrderInvoiceDownload } from "./hooks/useOrderInvoiceDownload";

interface Props {
  order: OrderWithItemsT | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: Props) {
  if (!order) return null;

  const formattedDate = format(
    new Date(order.created_at || 0),
    "MMMM dd, yyyy 'at' h:mm a",
  );
  const statusLabel = order.status || order.payment_status || "pending";
  const normalizedStatus = String(statusLabel).toLowerCase();
  const prettyStatusLabel = String(statusLabel)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const { handleDownloadInvoice } = useOrderInvoiceDownload(order);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-1.5rem)] md:max-w-3xl overflow-hidden border-white/20 bg-white p-0 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25),0_18px_36px_-18px_rgba(0,0,0,0.3)] rounded-[2.5rem]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Order #{order.order_number}</DialogTitle>
          <DialogDescription>
            Order details for {order.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="relative border-b border-neutral-100 px-8 pt-8 pb-7 md:px-10 md:pt-10 md:pb-8">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-8 right-8 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-100 bg-neutral-50 text-neutral-400 transition-all duration-300 hover:bg-neutral-100 hover:text-black"
            aria-label="Close order details modal"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
            Order Reference
          </span>
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#111111] md:text-3xl">
            Order #{order.order_number}
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-neutral-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
              Created
            </span>
            <span
              className={cn(
                "rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]",
                normalizedStatus === "pending" ||
                  normalizedStatus === "waiting_payment"
                  ? "bg-[#FEB47B] text-[#111111]"
                  : "bg-emerald-100 text-emerald-800",
              )}
            >
              {prettyStatusLabel}
            </span>
          </div>
        </div>

        <div className="px-8 py-8 md:px-10 md:py-10">
          <OrderSummarySection order={order} formattedDate={formattedDate} />
          <OrderItemsList items={order.order_items || []} isLoading={false} />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-100 bg-neutral-50 p-8 md:flex-row">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Stamp.AI Production Protocol v4.2
          </p>

          <Button
            type="button"
            onClick={handleDownloadInvoice}
            className="h-auto w-full rounded-full bg-neutral-900 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-black hover:shadow-xl md:w-auto"
          >
            Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
