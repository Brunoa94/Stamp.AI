import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export function OrdersHeader() {
  return (
    <header className="space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate)"
      >
        Your{" "}
        <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
          orders
        </span>
      </Heading>
      <Span variant="default" className="text-(--color-stamp-taupe)">
        View your orders
      </Span>
    </header>
  );
}
