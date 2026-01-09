import { Button } from "@/features/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";

export function PasswordResetRequestSuccess() {
  return (
    <DialogContent className="max-w-96">
      <div className="flex flex-col gap-4 text-center">
        <DialogHeader>
          <DialogTitle>Reset Email Sent!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            We've sent a password reset link to your email address. Please check
            your email and follow the instructions to reset your password.
          </p>
          <DialogClose asChild>
            <Button variant="default" className="w-full">
              Got it
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
}
