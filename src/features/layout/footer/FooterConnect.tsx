import Link from "next/link";
import { Button } from "@/features/ui/button";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { footerTheme } from "@/theme/components";

export function FooterConnect() {
  const currentYear = new Date().getFullYear();

  return (
    <div className={footerTheme.bottom}>
      <p className={footerTheme.copyright}>
        © {currentYear} Stamp.AI Design Inc. Crafted for the Dreamers.
      </p>

      <div className={footerTheme.socialRow}>
        <Button
          asChild
          id="social-tw"
          variant="ghost"
          size="icon"
          className={footerTheme.socialButton}
          aria-label="Twitter"
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
          aria-label="Instagram"
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
          aria-label="LinkedIn"
        >
          <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
            <Linkedin className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
