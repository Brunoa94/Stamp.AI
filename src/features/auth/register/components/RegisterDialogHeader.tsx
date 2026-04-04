import { Button } from "@/features/ui/button";
import { DialogClose } from "@/features/ui/dialog";
import { X } from "lucide-react";

export function RegisterDialogHeader() {
  return (
    <div className="mb-8 text-center">
      <DialogClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close register modal"
          className="absolute right-6 top-6 h-9 w-9 rounded-full text-slate-400 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </Button>
      </DialogClose>

      <h1 className="text-3xl font-heading tracking-tight text-slate-900">
        Create Account
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Join the Stamp.AI creative community today.
      </p>
    </div>
  );
}
