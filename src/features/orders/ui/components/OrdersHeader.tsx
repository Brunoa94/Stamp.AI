import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export function OrdersHeader() {
  return (
    <header className="space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading as="h1" variant="title">
        Your<span className="text-(--color-stamp-gold)"> orders</span>
      </Heading>
      <Span variant="default" className="text-(--color-stamp-taupe)">
        View your orders
      </Span>
    </header>
  );
}
