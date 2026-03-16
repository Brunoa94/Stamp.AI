import { Button } from "@/features/ui/button";
import { DialogClose } from "@/features/ui/dialog";

interface RegisterFormActionsProps {
  isPending: boolean;
}

export function RegisterFormActions({ isPending }: RegisterFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-end">
      <DialogClose asChild>
        <Button
          aria-label="Cancel"
          variant="outline"
          className="h-12 w-full rounded-xl border-slate-200 bg-white px-8 font-semibold text-slate-600 hover:bg-slate-50 md:w-auto"
        >
          Cancel
        </Button>
      </DialogClose>

      <Button
        aria-label="Create Account"
        variant="default"
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl bg-primary px-8 font-semibold text-primary-foreground hover:bg-primary/90 md:w-auto"
      >
        {isPending ? "Creating Account..." : "Create Account"}
      </Button>
    </div>
  );
}
