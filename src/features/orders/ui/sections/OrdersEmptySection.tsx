import { ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

interface PropsI {
  onInitiate: () => void;
}

export function OrdersEmptySection({ onInitiate }: PropsI) {
  return (
    <section
      className="flex flex-col items-center py-32 text-center"
      aria-label="Empty order archive"
    >
      <div className="mb-12 flex h-48 w-48 rotate-3 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
        <ShoppingBag className="h-16 w-16 text-(--color-stamp-taupe)/30" />
      </div>
      <Heading as="h2" variant="title" className="font-(--font-playfair) text-4xl italic">
        No Synthesis Records
      </Heading>
      <Paragraph
        variant="sm"
        className="mb-12 mt-4 text-[10px] tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        Try adjusting your archive filters or initiate a new synthesis protocol
      </Paragraph>
      <Button
        type="button"
        onClick={onInitiate}
        variant="default"
        className="bg-(--color-stamp-chocolate) px-6 py-3 text-[10px] tracking-[0.2em] text-white hover:bg-(--color-stamp-gold)"
      >
        Initiate Synthesis
      </Button>
    </section>
  );
}
