"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

/**
 * HeroBrandLockup
 *
 * The Stamp.ai wordmark above the hero headline: the "S" logo tile followed
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
        className="h-auto w-18 object-contain sm:w-20 xl:w-22"
        priority
      />
      <Heading
        as="div"
        variant="title"
        className="text-7xl text-(--color-stamp-chocolate) sm:text-8xl"
      >
        {t.rich("brand", {
          accent: (chunks) => (
            <Span variant="serif" className="-ml-2 text-(--color-stamp-taupe) sm:-ml-3">
              {chunks}
            </Span>
          ),
        })}
      </Heading>
    </div>
  );
}
