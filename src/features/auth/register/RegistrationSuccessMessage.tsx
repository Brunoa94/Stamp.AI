import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";

export function RegistrationSuccessMessage() {
  return (
    <DialogContent className="max-w-md border-2 border-(--color-stamp-divider) bg-(--color-stamp-off-white) p-10">
      <div className="flex flex-col gap-6 text-center">
        <DialogHeader>
          <DialogTitle className="sr-only">Registration Successful</DialogTitle>
          <Heading
            as="h2"
            variant="card"
            className="text-3xl tracking-tight text-(--color-stamp-chocolate)"
          >
            Registration Successful!
          </Heading>
        </DialogHeader>
        <div className="space-y-6">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            Your account has been created successfully. Please check your email
            to verify your account before logging in.
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
