import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { DialogClose } from "@/features/ui/dialog";

interface PropsI {
  isPending: boolean;
}

export function RegisterFormActions({ isPending }: PropsI) {
  const t = useTranslations("auth.register.actions");

  return (
    <div className="grid grid-cols-2 gap-4 pt-6">
      <DialogClose asChild>
        <Button aria-label={t("cancelAria")} variant="secondary">
          {t("cancel")}
        </Button>
      </DialogClose>

      <Button
        aria-label={t("createAccountAria")}
        type="submit"
        disabled={isPending}
        variant="primary"
      >
        {isPending ? t("creating") : t("signUp")}
      </Button>
    </div>
  );
}
