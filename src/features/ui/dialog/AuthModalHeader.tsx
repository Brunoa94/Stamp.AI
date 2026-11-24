import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface PropsI {
  label: string;
  title: string;
}

export function AuthModalHeader({ label, title }: PropsI) {
  return (
    <div className="mb-8">
      <Span as="p" variant="label" className="mb-2 text-(--color-stamp-gold-text)">
        {label}
      </Span>
      <Heading
        as="h2"
        variant="sectionDisplay"
        className="text-(--color-stamp-chocolate)"
      >
        {title}
      </Heading>
    </div>
  );
}
