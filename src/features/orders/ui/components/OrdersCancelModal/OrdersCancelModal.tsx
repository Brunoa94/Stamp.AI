import { useRef } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("orders.cancelModal");
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
      className="fixed inset-0 z-110 flex items-center justify-center bg-(--color-stamp-chocolate)/30 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("ariaLabel")}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md border border-(--color-stamp-error)/10 bg-(--color-stamp-white) p-10 text-center shadow-(--shadow-stamp-modal-error)"
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
