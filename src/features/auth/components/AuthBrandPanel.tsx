import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { List } from "@/features/ui/list";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

/**
 * AuthBrandPanel
 *
 * Inverted chocolate side of the auth dialogs: amber accent bar, eyebrow,
 * slab-serif headline with a handwritten accent and the perks of having an
 * account, matching the chocolate HomeCtaSection panel. Hidden below `md`, where the form alone
 * fits the screen.
 *
 * Copy comes from `namespace`: eyebrow, heading (with an <accent> chunk set
 * in the gold serif), lead, and a `perks` object listed in order.
 */

interface PropsI {
  namespace: "auth.login.panel" | "auth.register.panel";
}

export function AuthBrandPanel({ namespace }: PropsI) {
  const t = useTranslations(namespace);
  const perks = Object.values(t.raw("perks") as Record<string, string>);

  return (
    <div className="relative hidden h-full overflow-hidden bg-(--color-stamp-chocolate) p-10 md:flex md:flex-col lg:p-12">
      <div className="relative flex h-full flex-col">
        <Image
          src={staticAssetUrl("/logo-white-leather.webp")}
          alt=""
          aria-hidden
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
        />

        <div className="mt-auto pt-16">
          <div className="mb-6 h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" aria-hidden="true" />
          <Span as="p" variant="label" className="mb-3 text-(--color-stamp-gold-light)">
            {t("eyebrow")}
          </Span>
          <Heading
            as="div"
            variant="card"
            className="mb-6 text-4xl text-(--color-stamp-off-white) lg:text-5xl"
          >
            {t.rich("heading", {
              accent: (chunks) => (
                <Span variant="serif" className="text-(--color-stamp-gold-light)">
                  {chunks}
                </Span>
              ),
            })}
          </Heading>
          <Paragraph variant="sm" className="mb-10 text-(--color-stamp-taupe-light)">
            {t("lead")}
          </Paragraph>

          <List className="space-y-4 border-t border-(--color-stamp-off-white)/15 pt-8">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-4">
                <Span
                  unstyled
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--color-stamp-gold) text-(--color-stamp-chocolate)"
                >
                  <Check className="size-4" />
                </Span>
                <Span variant="default" className="text-(--color-stamp-off-white)">
                  {perk}
                </Span>
              </li>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}
