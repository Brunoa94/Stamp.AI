interface OrderCardInfoProps {
  orderNumber: string;
  formattedDate: string;
  customerName: string | null | undefined;
  itemCount: number;
}

export function OrderCardInfo({
  orderNumber,
  formattedDate,
  customerName,
  itemCount,
}: OrderCardInfoProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
          Order #{orderNumber}
        </h3>
        <span className="text-sm text-gray-400">•</span>
        <p className="text-sm font-medium text-gray-500">{formattedDate}</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        {customerName && (
          <>
            <span className="font-medium text-gray-700">{customerName}</span>
            <span className="text-gray-300">|</span>
          </>
        )}
        <span>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
    </div>
  );
}
