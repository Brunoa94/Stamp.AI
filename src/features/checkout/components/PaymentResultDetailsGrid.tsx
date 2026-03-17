import clsx from "clsx";

interface PaymentResultGridItemI {
  label: string;
  value: string;
  valueMuted?: boolean;
}

interface Props {
  items: PaymentResultGridItemI[];
  statusLabel: string;
  statusValue: string;
  statusVariant?: "success" | "error";
}

const styles = {
  grid: "grid grid-cols-2 gap-8 text-left border-y border-slate-100 py-8 mb-12",
  item: "flex flex-col gap-1",
  label: "text-[10px] font-bold uppercase tracking-widest text-slate-400",
  value: "text-base font-heading text-slate-900",
  valueMuted: "text-base font-heading text-slate-400",
  statusBadge: "flex items-center gap-1.5",
  statusDot: "w-1.5 h-1.5 rounded-full",
  statusText: "text-xs font-bold uppercase tracking-widest",
  successDot: "bg-green-500 animate-pulse",
  successText: "text-green-600",
  errorDot: "bg-red-500",
  errorText: "text-red-500",
} as const;

export function PaymentResultDetailsGrid({
  items,
  statusLabel,
  statusValue,
  statusVariant = "success",
}: Props) {
  return (
    <div className={styles.grid} aria-live="polite">
      {items.map((item) => (
        <div className={styles.item} key={item.label}>
          <span className={styles.label}>{item.label}</span>
          <span
            className={clsx(styles.value, item.valueMuted && styles.valueMuted)}
          >
            {item.value}
          </span>
        </div>
      ))}

      <div className={styles.item}>
        <span className={styles.label}>{statusLabel}</span>
        <div className={styles.statusBadge}>
          <span
            className={clsx(
              styles.statusDot,
              statusVariant === "success" ? styles.successDot : styles.errorDot,
            )}
            aria-hidden="true"
          />
          <span
            className={clsx(
              styles.statusText,
              statusVariant === "success"
                ? styles.successText
                : styles.errorText,
            )}
          >
            {statusValue}
          </span>
        </div>
      </div>
    </div>
  );
}
