import { Button } from "@/features/ui/button";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";

interface PropsI {
  /** Swaps the open dialog to the Login form. */
  onSwitchToLogin: () => void;
}

export function RegisterLoginFooter({ onSwitchToLogin }: PropsI) {
  const t = useTranslations("auth.register.footer");

  return (
    <div className="mt-10 text-center">
      <div className="mb-8 h-px w-full bg-(--color-stamp-divider)" />
      <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
        {t.rich("haveAccount", {
          link: (chunks) => (
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              className="ml-1 h-auto p-0 font-[family-name:inherit] text-base font-bold text-(--color-stamp-gold-text) hover:text-(--color-stamp-chocolate) hover:underline focus-visible:ring-(--color-stamp-chocolate)"
            >
              {chunks}
            </Button>
          ),
        })}
      </Paragraph>
    </div>
  );
}
