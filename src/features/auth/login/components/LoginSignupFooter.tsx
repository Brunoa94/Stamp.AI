import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { useTranslations } from "next-intl";

interface PropsI {
  /** Swaps the open dialog to the Sign Up form. */
  onSwitchToRegister: () => void;
}

export function LoginSignupFooter({ onSwitchToRegister }: PropsI) {
  const t = useTranslations("auth.login.footer");

  return (
    <div className="mt-10 text-center">
      <div className="mb-8 h-px w-full bg-(--color-stamp-divider)" />
      <Paragraph variant="body" className="text-sm font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
        {t.rich("noAccount", {
          link: (chunks) => (
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToRegister}
              className="ml-1 h-auto p-0 font-[family-name:inherit] text-base font-bold uppercase tracking-widest text-(--color-stamp-gold-text) hover:text-(--color-stamp-chocolate) hover:underline"
            >
              {chunks}
            </Button>
          ),
        })}
      </Paragraph>
    </div>
  );
}
