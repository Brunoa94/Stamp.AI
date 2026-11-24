import { Span } from "@/features/ui/span";

/**
 * AuthEmailDivider
 *
 * Amber-labelled rule between the Google button and the email form.
 */

interface PropsI {
  label: string;
}

export function AuthEmailDivider({ label }: PropsI) {
  return (
    <div className="relative my-8 flex items-center">
      <div className="grow border-t border-(--color-stamp-divider)" />
      <Span variant="label" className="mx-4 shrink text-(--color-stamp-gold-text)">
        {label}
      </Span>
      <div className="grow border-t border-(--color-stamp-divider)" />
    </div>
  );
}
