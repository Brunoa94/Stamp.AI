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
    <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 mt-8 border-t border-(--color-stamp-divider)">
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSaving}
        className="w-full sm:w-auto bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.15em] uppercase disabled:opacity-50"
      >
        {isSaving ? t("saving") : t("saveAddress")}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="w-full sm:w-auto border-2 border-(--color-stamp-divider) bg-transparent text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.15em] uppercase"
      >
        {t("cancel")}
      </Button>
    </div>
  );
}
