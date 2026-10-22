"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

/**
 * HeroBrandLockup
 *
 * The Stamp.ai wordmark, a kicker above the hero headline (kept smaller than
 * the h1 so the headline leads): the "S" logo tile followed
 * by "tamp" and a handwritten ".ai". Exposed to assistive tech as one image
 * named "Stamp.ai" so the split letters aren't read out separately.
 */
export function HeroBrandLockup() {
  const t = useTranslations("home.hero");

  return (
    <div role="img" aria-label={t("brandLabel")} className="flex items-center">
      <Image
        src="/logo.png"
        alt=""
        width={88}
        height={92}
        className="h-auto w-14 rounded-lg bg-(--color-stamp-off-white) object-contain sm:w-19 lg:w-24"
        priority
      />
      <Heading
        as="div"
        variant="title"
        className="text-7xl text-(--color-stamp-off-white) sm:text-8xl md:text-8xl lg:text-9xl"
      >
        {t.rich("brand", {
          accent: (chunks) => (
            <Span variant="serif" className="-ml-2 text-(--color-stamp-gold-light) sm:-ml-3">
              {chunks}
            </Span>
          ),
        })}
      </Heading>
    </div>
  );
}
