import { Button } from "@/features/ui/button";

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
    <div className="flex items-center gap-3 pt-4">
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSaving}
        className="bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold uppercase tracking-widest text-xs px-6 py-2"
      >
        {isSaving ? "Saving..." : "Save Address"}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        variant="ghost"
        disabled={isSaving}
        className="border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-xs px-6 py-2"
      >
        Cancel
      </Button>
    </div>
  );
}
