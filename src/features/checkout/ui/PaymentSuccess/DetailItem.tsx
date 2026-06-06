interface DetailItemProps {
  label: string;
  value: string;
}

/**
 * DetailItem - Single detail field display atom
 * Used in payment success details grid to show label-value pairs
 */
export function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-base font-heading text-slate-900">{value}</span>
    </div>
  );
}
