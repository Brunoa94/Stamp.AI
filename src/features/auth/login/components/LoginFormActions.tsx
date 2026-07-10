import { Button } from "@/features/ui/button";
import { DialogClose } from "@/features/ui/dialog";

interface PropsI {
  isPending: boolean;
}

export function LoginFormActions({ isPending }: PropsI) {
  return (
    <div className="grid grid-cols-2 gap-4 pt-6">
      <DialogClose asChild>
        <Button aria-label="Cancel" variant="stamp-auth-cancel">
          Cancel
        </Button>
      </DialogClose>

      <Button
        aria-label="Login"
        type="submit"
        disabled={isPending}
        variant="stamp-auth-primary"
      >
        {isPending ? "Logging in..." : "Login"}
      </Button>
    </div>
  );
}
