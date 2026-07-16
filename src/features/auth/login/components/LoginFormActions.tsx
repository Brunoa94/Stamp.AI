import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { DialogClose } from "@/features/ui/dialog";

interface PropsI {
  isPending: boolean;
}

export function LoginFormActions({ isPending }: PropsI) {
  const t = useTranslations("auth.login.actions");

  return (
    <div className="grid grid-cols-2 gap-4 pt-6">
      <DialogClose asChild>
        <Button aria-label={t("cancelAria")} variant="stamp-auth-cancel">
          {t("cancel")}
        </Button>
      </DialogClose>

      <Button
        aria-label={t("loginAria")}
        type="submit"
        disabled={isPending}
        variant="stamp-auth-primary"
      >
        {isPending ? t("loggingIn") : t("login")}
      </Button>
    </div>
  );
}
