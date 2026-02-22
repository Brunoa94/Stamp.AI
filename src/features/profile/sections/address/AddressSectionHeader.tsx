import { Button } from "@/features/ui/button";
import { MapPin } from "lucide-react";

interface AddressSectionHeaderProps {
  hasAddress: boolean;
  isEditing: boolean;
  onEdit: () => void;
}

export function AddressSectionHeader({
  hasAddress,
  isEditing,
  onEdit,
}: AddressSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <MapPin className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Shipping Address
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasAddress
              ? "Manage your default shipping address"
              : "Add a shipping address for faster checkout"}
          </p>
        </div>
      </div>
      {!isEditing && (
        <Button
          onClick={onEdit}
          variant="outline"
          className="border-gray-300 text-slate-700 hover:bg-gray-50 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-900/20"
        >
          {hasAddress ? "Edit" : "Add Address"}
        </Button>
      )}
    </div>
  );
}
