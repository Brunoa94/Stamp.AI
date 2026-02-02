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
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
          className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
        >
          {hasAddress ? "Edit" : "Add Address"}
        </Button>
      )}
    </div>
  );
}
