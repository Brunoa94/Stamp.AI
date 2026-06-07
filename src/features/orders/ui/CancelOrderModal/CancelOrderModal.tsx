"use client";

import { Modal } from "@/features/ui/modal/Modal";
import { Button } from "@/features/ui/button";
import { OrderWithItemsT } from "@/types/order";
import { AlertTriangle } from "lucide-react";

interface CancelOrderModalProps {
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
}: CancelOrderModalProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Order"
      description="Confirm order cancellation"
      className="max-w-md"
    >
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Are you sure you want to cancel this order?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order #{order.order_number || order.id.slice(0, 8)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isLoading}
        >
          Keep Order
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Cancelling..." : "Cancel Order"}
        </Button>
      </div>
    </Modal>
  );
}
