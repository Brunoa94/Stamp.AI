import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface PropsI {
  label: string;
  title: string;
}

export function AuthModalHeader({ label, title }: PropsI) {
  return (
    <div className="mb-10">
      <Span
        as="p"
        variant="micro"
        className="mb-2 tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        {label}
      </Span>
      <Heading
        as="h2"
        variant="card"
        className="text-5xl tracking-tight text-(--color-stamp-chocolate)"
      >
        {title}
      </Heading>
    </div>
  );
}
