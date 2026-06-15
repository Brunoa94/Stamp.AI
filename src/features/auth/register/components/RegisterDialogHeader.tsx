import { AuthModalHeader } from "@/features/ui/dialog/AuthModalHeader";
import { Span } from "@/features/ui/span";

export function RegisterDialogHeader() {
  return (
    <div>
      <AuthModalHeader label="Create Account" title="Sign Up" />
      <Span
        as="p"
        unstyled
        className="text-sm font-medium text-ink/60 font-space mb-2"
      >
        Join the Stamp.AI creative community today.
      </Span>
    </div>
  );
}
