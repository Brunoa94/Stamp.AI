import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

type TrustIndicatorItemType = {
  label: string;
  dotClassName: string;
};

interface PropsI {
  items: TrustIndicatorItemType[];
  className?: string;
}

export function TrustIndicators({ items, className }: PropsI) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-8 text-[10px] font-bold tracking-[0.3em] uppercase font-space",
        className,
      )}
    >
      {items.map((item) => (
        <Span key={item.label} className="flex items-center gap-2">
          <Span
            className={cn(
              "w-2 h-2 rounded-full animate-[pulseSlow_3s_ease-in-out_infinite]",
              item.dotClassName,
            )}
          />
          {item.label}
        </Span>
      ))}
    </div>
  );
}
