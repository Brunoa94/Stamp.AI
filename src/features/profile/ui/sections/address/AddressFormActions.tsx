import { Button } from "@/features/ui/button";
import { Save, X } from "lucide-react";

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
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 mt-8 border-t border-slate-200/50">
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSaving}
        variant="brutalist-primary"
        className="w-full sm:w-auto group"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "SAVING..." : "SAVE ADDRESS"}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        variant="brutalist-ghost"
        disabled={isSaving}
        className="w-full sm:w-auto"
      >
        <X className="w-4 h-4 mr-2" />
        CANCEL
      </Button>
    </div>
  );
}
