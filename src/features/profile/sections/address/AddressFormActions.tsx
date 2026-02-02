import { Button } from "@/features/ui/button";
import { Save, X } from "lucide-react";

interface AddressFormActionsProps {
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function AddressFormActions({
  onSave,
  onCancel,
  isSaving,
}: AddressFormActionsProps) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSaving}
        className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Saving..." : "Save Address"}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        variant="outline"
        disabled={isSaving}
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}
