import { Button } from "@/features/ui/button";
import { useTranslations } from "next-intl";

interface AddressFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function AddressFormActions({
  onSave,
  onCancel,
  isSaving,
}: AddressFormActionsProps) {
  const t = useTranslations("profile.address");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 mt-6 border-t border-(--color-stamp-divider)">
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSaving}
        variant="primary"
        className="w-full sm:w-auto"
      >
        {isSaving ? t("saving") : t("saveAddress")}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        variant="secondary"
        className="w-full sm:w-auto"
      >
        {t("cancel")}
      </Button>
    </div>
  );
}
