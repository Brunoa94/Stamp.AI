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
          className="h-auto py-3.5 font-bold uppercase tracking-wide shadow-none hover:shadow-none"
        >
          {isCancelling ? t("halting") : t("haltSynthesis")}
        </Button>
        <Button
          ref={ref}
          onClick={onClose}
          disabled={isCancelling}
          variant="secondary"
        >
          {t("keepActive")}
        </Button>
      </div>
    );
  },
);
