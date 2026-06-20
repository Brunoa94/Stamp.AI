import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface PropsI {
  label: string;
  title: string;
}

export function AuthModalHeader({ label, title }: PropsI) {
  return (
    <div className="mb-10">
      <Span as="p" variant="default" className="mb-1 text-ink/40">
        {label}
      </Span>
      <Heading as="h2" variant="card" className="text-ink text-5xl">
        {title}
      </Heading>
    </div>
  );
}
