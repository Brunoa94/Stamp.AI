import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";

interface PropsI {
  isCancelling: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const OrdersCancelModalActions = forwardRef<HTMLButtonElement, PropsI>(
  function OrdersCancelModalActions({ isCancelling, onConfirm, onClose }, ref) {
    const t = useTranslations("orders.cancelModal");

    return (
      <div className="flex flex-col gap-3">
        <Button
          onClick={onConfirm}
          disabled={isCancelling}
          variant="destructive"
          className="py-4 text-[10px] tracking-[0.2em]"
        >
          {isCancelling ? t("halting") : t("haltSynthesis")}
        </Button>
        <Button
          ref={ref}
          onClick={onClose}
          disabled={isCancelling}
          variant="outline"
          className="border-(--color-stamp-divider) bg-transparent py-4 text-[10px] tracking-[0.2em] text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white)"
        >
          {t("keepActive")}
        </Button>
      </div>
    );
  },
);
