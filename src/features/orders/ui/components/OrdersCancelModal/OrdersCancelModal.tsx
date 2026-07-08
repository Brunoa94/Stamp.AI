import { useRef } from "react";
import { useModalFocusTrap } from "@/hooks/useModalFocusTrap";
import type { OrderWithItemsT } from "@/types/order";
import { OrdersCancelModalIcon } from "./OrdersCancelModalIcon";
import { OrdersCancelModalHeader } from "./OrdersCancelModalHeader";
import { OrdersCancelModalActions } from "./OrdersCancelModalActions";

interface PropsI {
  isOpen: boolean;
  order: OrderWithItemsT | null;
  isCancelling: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function OrdersCancelModal({
  isOpen,
  order,
  isCancelling,
  onConfirm,
  onClose,
}: PropsI) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useModalFocusTrap({
    isOpen: isOpen && !!order,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 z-110 flex items-center justify-center bg-[rgba(61,40,23,0.3)] p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Cancel order confirmation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md border border-red-100 bg-white p-10 text-center shadow-[0_50px_100px_rgba(239,68,68,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <OrdersCancelModalIcon />
        <OrdersCancelModalHeader />
        <OrdersCancelModalActions
          ref={closeButtonRef}
          isCancelling={isCancelling}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
