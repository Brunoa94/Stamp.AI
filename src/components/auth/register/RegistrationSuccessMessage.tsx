import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RegistrationSuccessMessage() {
  return (
    <DialogContent className="max-w-96">
      <div className="flex flex-col gap-4 text-center">
        <DialogHeader>
          <DialogTitle>Registration Successful!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your account has been created successfully. Please check your email to verify your account before logging in.
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