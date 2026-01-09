import { UserPlus } from "lucide-react";
import { RegisterForm } from "./RegisterForm";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";

interface RegisterProps {
  className?: string;
}

export function Register({ className }: RegisterProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Open register dialog"
          className={className}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Sign Up
        </Button>
      </DialogTrigger>
      <RegisterForm />
    </Dialog>
  );
}
