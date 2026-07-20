import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";
import { useTranslations } from "next-intl";

export function PasswordResetRequestSuccess() {
  const t = useTranslations("auth.passwordReset.requestSuccess");

  return (
    <DialogContent className="max-w-md border-2 border-(--color-stamp-divider) bg-(--color-stamp-off-white) p-10">
      <div className="flex flex-col gap-6 text-center">
        <DialogHeader>
          <DialogTitle className="sr-only">{t("srTitle")}</DialogTitle>
          <Heading
            as="h2"
            variant="card"
            className="text-3xl tracking-tight text-(--color-stamp-chocolate)"
          >
            {t("title")}
          </Heading>
        </DialogHeader>
        <div className="space-y-6">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("description")}
          </Paragraph>
          <DialogClose asChild>
            <Button variant="primary" className="w-full">
              {t("gotIt")}
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
}
