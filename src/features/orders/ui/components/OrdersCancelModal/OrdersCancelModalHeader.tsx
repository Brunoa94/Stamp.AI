import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function OrdersCancelModalHeader() {
  return (
    <>
      <Heading as="h3" variant="card" className="mb-4 text-2xl tracking-tight">
        Halt Protocol?
      </Heading>
      <Paragraph
        variant="sm"
        className="mb-10 text-xs tracking-[0.15em] text-(--color-stamp-taupe)"
      >
        This action is irreversible once finalized.
      </Paragraph>
    </>
  );
}
