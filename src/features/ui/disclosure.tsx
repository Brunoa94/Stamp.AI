import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";

/**
 * Disclosure
 *
 * A collapsible card (FAQ item) built on native <details>/<summary>: keyboard
 * accessible and zero JS. The title renders as a Heading inside the toggle, with
 * a plus icon that turns into a cross when open. The body comes from `children`;
 * its typography (usually a Paragraph) comes from the caller.
 */

interface DisclosureProps {
  title: React.ReactNode;
  titleAs?: "h2" | "h3" | "h4";
  className?: string;
  children: React.ReactNode;
}

export function Disclosure({ title, titleAs = "h3", className, children }: DisclosureProps) {
  return (
    <details
      className={cn(
        "group rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) px-5 shadow-(--shadow-stamp-card) transition-colors open:border-(--color-stamp-gold) hover:border-(--color-stamp-gold) lg:px-6",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-xl py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) [&::-webkit-details-marker]:hidden">
        <Heading
          as={titleAs}
          variant="faqQuestion"
          className="text-lg font-medium text-(--color-stamp-chocolate) md:text-xl"
        >
          {title}
        </Heading>
        <Plus
          aria-hidden
          className="size-5 flex-none text-(--color-stamp-taupe) transition-transform duration-200 group-open:rotate-45 group-open:text-(--color-stamp-gold-text)"
        />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
