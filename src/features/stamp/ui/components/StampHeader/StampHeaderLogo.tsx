"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

interface PropsI {
  onNavigate: () => void;
}

/** Logo mark plus wordmark; the wordmark hides on the narrowest screens. */
export function StampHeaderLogo({ onNavigate }: PropsI) {
  const t = useTranslations("stamp.header");

  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label={t("logoAria")}
      className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)"
    >
      <Image
        src="/logo.png"
        alt=""
        width={44}
        height={44}
        className="size-11 object-contain"
        priority
      />
      <Span
        variant="strong"
        className="hidden text-lg tracking-tight text-(--color-stamp-chocolate) sm:inline"
      >
        {t("brand")}
      </Span>
    </Link>
  );
}
