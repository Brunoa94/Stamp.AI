/**
 * GoogleReviewAuthorLink
 *
 * The reviewer's name, linked to their Google profile.
 */

import { useTranslations } from "next-intl";
import { Anchor } from "@/features/ui/anchor";
import { Span } from "@/features/ui/span";

interface PropsI {
  name: string;
  href: string;
}

export function GoogleReviewAuthorLink({ name, href }: PropsI) {
  const t = useTranslations("home.googleReviews");

  return (
    <Anchor
      href={href}
      rel="ugc nofollow noopener noreferrer"
      variant="subtle"
      className="block truncate text-sm text-(--color-stamp-chocolate)"
    >
      {name}
      <Span unstyled className="sr-only">
        {" "}
        {t("opensInNewTab")}
      </Span>
    </Anchor>
  );
}
