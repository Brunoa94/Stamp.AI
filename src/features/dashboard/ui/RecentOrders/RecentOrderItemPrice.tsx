import { Span } from "@/features/ui/span";

interface PropsI {
  amount: number;
}

export function RecentOrderItemPrice({ amount }: PropsI) {
  return (
    <div className="flex flex-col items-end">
      <Span variant="default" className="font-anton text-lg tracking-tight text-ink">
        ${(amount / 100).toFixed(2)}
      </Span>
      <Span variant="micro" className="text-ink/30">
        SYNTHESIS COST
      </Span>
    </div>
  );
}
