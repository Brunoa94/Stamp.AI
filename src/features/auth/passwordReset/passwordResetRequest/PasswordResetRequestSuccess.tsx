import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";

export function PasswordResetRequestSuccess() {
  return (
    <DialogContent className="max-w-md border-2 border-(--color-stamp-divider) bg-(--color-stamp-off-white) p-10">
      <div className="flex flex-col gap-6 text-center">
        <DialogHeader>
          <DialogTitle className="sr-only">Reset Email Sent</DialogTitle>
          <Heading
            as="h2"
            variant="card"
            className="text-3xl tracking-tight text-(--color-stamp-chocolate)"
          >
            Reset Email Sent!
          </Heading>
        </DialogHeader>
        <div className="space-y-6">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            We've sent a password reset link to your email address. Please check
            your email and follow the instructions to reset your password.
          </Paragraph>
          <DialogClose asChild>
            <Button variant="stamp-auth-primary" className="w-full">
              Got it
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
}
