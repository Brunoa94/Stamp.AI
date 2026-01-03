import clsx from "clsx";
interface Props<T> {
  value: T;
  label: string;
  handleValueChange: (value: T, buttonRef: HTMLButtonElement) => void;
  isActive?: boolean;
}

function FilterTab<T>({ value, label, handleValueChange, isActive }: Props<T>) {
  return (
    <button
      key={String(value)}
      className={clsx(
        "ring-offset-background focus-visible:ring-ring relative z-10 inline-flex cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "text-foreground bg-background"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={(e) => handleValueChange(value, e.currentTarget)}
    >
      {label}
    </button>
  );
}

export default FilterTab;
