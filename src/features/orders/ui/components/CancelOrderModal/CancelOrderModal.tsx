"use client";

import { Modal } from "@/features/ui/modal/Modal";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { OrderWithItemsT } from "@/types/order";
import { AlertTriangle } from "lucide-react";

interface PropsI {
  order: OrderWithItemsT | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: PropsI) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terminate Order?"
      description="Confirm order cancellation"
      className="max-w-lg border-4 border-red-500/10 bg-white p-10 shadow-2xl"
    >
      <div className="flex flex-col items-center gap-8 py-2 text-center">
        <AlertTriangle className="h-28 w-28 text-red-500" />

        <div className="space-y-6">
          <Heading as="h2" variant="card" className="text-ink">
            Terminate Order?
          </Heading>
          <Span as="p" variant="sm" className="text-ink/60 leading-loose">
            This action will permanently cancel order{" "}
            <Span as="span" unstyled className="font-bold text-ink">
              {order.order_number || order.id.slice(0, 13).toUpperCase()}
            </Span>
            . This protocol cannot be reversed once synthesis is halted.
          </Span>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Cancelling..." : "Halt & Cancel Order"}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Keep Protocol Active
        </Button>
      </div>
    </Modal>
  );
}
