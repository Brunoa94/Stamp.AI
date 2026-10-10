import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

interface PropsI {
  title: string;
  description: string;
  className?: string;
}

export function PaymentResultHeading({
  title,
  description,
  className,
}: PropsI) {
  return (
    <div className={className}>
      <Heading
        as="h1"
        variant="card"
        className="text-(--color-stamp-chocolate) mb-4"
      >
        {title}
      </Heading>
      <Paragraph
        variant="sm"
        className="text-(--color-stamp-taupe) max-w-sm mx-auto"
      >
        {description}
      </Paragraph>
    </div>
  );
}
