import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

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
