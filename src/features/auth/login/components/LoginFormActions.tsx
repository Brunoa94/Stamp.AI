import { Button } from "@/features/ui/button";
import { DialogClose } from "@/features/ui/dialog";

interface LoginFormActionsProps {
  isPending: boolean;
}

export function LoginFormActions({ isPending }: LoginFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
      <Button
        aria-label="Login"
        variant="default"
        type="submit"
        disabled={isPending}
        className="h-14 flex-[1.5] rounded-2xl bg-slate-900 font-bold tracking-[0.05em] text-white hover:bg-black"
      >
        {isPending ? "Logging in..." : "Login"}
      </Button>

      <DialogClose asChild>
        <Button
          aria-label="Cancel"
          variant="outline"
          className="h-14 flex-1 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </Button>
      </DialogClose>
    </div>
  );
}
