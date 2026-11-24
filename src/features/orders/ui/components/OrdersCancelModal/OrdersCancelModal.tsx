import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useModalFocusTrap } from "@/shared/hooks/useModalFocusTrap";
import type { OrderWithItemsT } from "@/shared/types/order";
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
      className="fixed inset-0 z-110 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("ariaLabel")}
    >
      {/* Clicking outside closes; keyboard users close with Escape or the keep-order button. */}
      <Button
        type="button"
        variant="unstyled"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-(--color-stamp-chocolate)/30 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 text-center shadow-(--shadow-stamp-modal)"
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
