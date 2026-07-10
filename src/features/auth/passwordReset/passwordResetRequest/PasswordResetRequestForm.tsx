import { usePasswordResetRequestForm } from "./usePasswordResetRequestForm";
import { PasswordResetRequestSuccess } from "./PasswordResetRequestSuccess";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";
import { FormField } from "@/features/ui/form-field";
import { Button } from "@/features/ui/button";

export function PasswordResetRequestForm() {
  const { register, handleSubmit, onSubmit, isPending, errors, isSuccess } =
    usePasswordResetRequestForm();

  if (isSuccess) {
    return <PasswordResetRequestSuccess />;
  }

  return (
    <DialogContent className="max-w-md border-2 border-(--color-stamp-divider) bg-(--color-stamp-off-white) p-10">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle className="sr-only">Reset Password</DialogTitle>
          <Heading
            as="h2"
            variant="card"
            className="text-center text-3xl tracking-tight text-(--color-stamp-chocolate)"
          >
            Reset Password
          </Heading>
        </DialogHeader>

        <div className="space-y-6">
          <Paragraph variant="sm" className="text-center text-(--color-stamp-taupe)">
            Enter your email address and we'll send you a link to reset your
            password.
          </Paragraph>

          <FormField
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message}
            register={register("email")}
            variant="stamp-auth"
          />
        </div>

        <DialogFooter className="flex flex-col gap-3">
          <Button
            aria-label="Send Reset Email"
            variant="stamp-auth-primary"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Sending..." : "Send Reset Email"}
          </Button>
          <DialogClose asChild>
            <Button aria-label="Cancel" variant="stamp-auth-cancel">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
