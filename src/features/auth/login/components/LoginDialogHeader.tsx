import { DialogClose } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { X } from "lucide-react";

export function LoginDialogHeader() {
  return (
    <div className="mb-8 flex items-start justify-between gap-3">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Access Account
        </p>
        <h2 className="font-heading text-5xl leading-none tracking-tight text-slate-900">
          LOGIN
        </h2>
      </div>

      <DialogClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close login modal"
          className="h-10 w-10 rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </Button>
      </DialogClose>
    </div>
  );
}
