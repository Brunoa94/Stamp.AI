import { DialogClose } from "@/features/ui/dialog";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { useTranslations } from "next-intl";
import { LazyRegisterForm } from "../../components/LazyRegisterForm";

export function LoginSignupFooter() {
  const t = useTranslations("auth.login.footer");

  return (
    <div className="mt-10 text-center">
      <div className="mb-8 h-px w-full bg-(--color-stamp-divider)" />
      <Paragraph variant="body" className="text-sm font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
        {t.rich("noAccount", {
          link: (chunks) => (
            <Dialog>
              <DialogClose asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="h-auto p-0 font-bold text-(--color-stamp-gold-text) hover:text-(--color-stamp-chocolate) hover:underline ml-1"
                  >
                    {chunks}
                  </Button>
                </DialogTrigger>
              </DialogClose>
              <LazyRegisterForm />
            </Dialog>
          ),
        })}
      </Paragraph>
    </div>
  );
}
