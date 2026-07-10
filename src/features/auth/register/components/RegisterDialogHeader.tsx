import { AuthModalHeader } from "@/features/ui/dialog/AuthModalHeader";
import { Paragraph } from "@/features/ui/paragraph";

export function RegisterDialogHeader() {
  return (
    <div>
      <AuthModalHeader label="Create Account" title="Sign Up" />
      <Paragraph variant="sm" className="text-(--color-stamp-taupe) mb-2">
        Join the Stamp.AI creative community today.
      </Paragraph>
    </div>
  );
}
