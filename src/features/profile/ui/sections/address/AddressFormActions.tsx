import { Button } from "@/features/ui/button";
import { Save, X } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 mt-8 border-t border-(--color-stamp-divider)">
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSaving}
        variant="primary-compact"
        className="w-full sm:w-auto group"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? t("saving") : t("saveAddress")}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        variant="secondary-compact"
        disabled={isSaving}
        className="w-full sm:w-auto"
      >
        <X className="w-4 h-4 mr-2" />
        {t("cancel")}
      </Button>
    </div>
  );
}
