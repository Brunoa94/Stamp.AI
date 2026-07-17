import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { RegisterForm } from "./RegisterForm";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";

interface RegisterProps {
  className?: string;
}

export function Register({ className }: RegisterProps) {
  const t = useTranslations("auth.register");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label={t("openDialogAria")}
          className={className}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t("signUp")}
        </Button>
      </DialogTrigger>
      <RegisterForm />
    </Dialog>
  );
}
