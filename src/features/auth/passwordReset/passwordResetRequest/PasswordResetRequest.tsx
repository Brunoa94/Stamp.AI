import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { PasswordResetRequestSkeleton } from "./PasswordResetRequestSkeleton";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";

const PasswordResetRequestForm = dynamic(
  () =>
    import("./PasswordResetRequestForm").then((mod) => ({
      default: mod.PasswordResetRequestForm,
    })),
  {
    loading: () => <PasswordResetRequestSkeleton />,
  }
);

interface PasswordResetRequestProps {
  className?: string;
}

export function PasswordResetRequest({ className }: PasswordResetRequestProps) {
  const t = useTranslations("auth.passwordReset.request");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className={`text-lg p-0 h-auto text-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) ${className}`}
        >
          {t("forgotPassword")}
        </Button>
      </DialogTrigger>
      <PasswordResetRequestForm />
    </Dialog>
  );
}
