import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { footerTheme } from "@/theme/components";

export function FooterConnect() {
  const t = useTranslations("layout.footer");
  const currentYear = new Date().getFullYear();

  return (
    <div className={footerTheme.bottom}>
      <p className={footerTheme.copyright}>
        {t("copyright", { year: currentYear })}
      </p>

      <div className={footerTheme.socialRow}>
        <Button
          asChild
          id="social-tw"
          variant="ghost"
          size="icon"
          className={footerTheme.socialButton}
          aria-label={t("social.twitter")}
        >
          <Link href="https://twitter.com" target="_blank" rel="noreferrer">
            <Twitter className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          asChild
          id="social-ig"
          variant="ghost"
          size="icon"
          className={footerTheme.socialButton}
          aria-label={t("social.instagram")}
        >
          <Link href="https://instagram.com" target="_blank" rel="noreferrer">
            <Instagram className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          asChild
          id="social-li"
          variant="ghost"
          size="icon"
          className={footerTheme.socialButton}
          aria-label={t("social.linkedin")}
        >
          <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
            <Linkedin className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
