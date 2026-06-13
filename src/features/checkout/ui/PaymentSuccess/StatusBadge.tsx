interface PropsI {
  status: string;
}

/**
 * StatusBadge - Payment status indicator
 * Displays order status with animated pulse dot
 */
export function StatusBadge({ status }: PropsI) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
        aria-hidden="true"
      />
      <span className="text-xs font-bold uppercase tracking-widest text-green-600">
        {status}
      </span>
    </div>
  );
}
