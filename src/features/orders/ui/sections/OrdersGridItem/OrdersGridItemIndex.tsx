import { Span } from "@/features/ui/span";

interface PropsI {
  index: number;
}

export function OrdersGridItemIndex({ index }: PropsI) {
  return (
    <Span
      variant="badge"
      className="absolute left-4 top-4 z-10 rounded-md bg-(--color-stamp-chocolate) px-2 py-1 text-(--color-stamp-white)"
    >
      {String(index).padStart(2, "0")}
    </Span>
  );
}
