import Image from "next/image";
import { LOCALE_FLAGS, type LocaleT } from "@/i18n/locales";

interface PropsI {
  locale: LocaleT;
}

/**
 * LocaleFlag
 *
 * The small flag beside a language. Decorative: the language name or code
 * next to it carries the meaning.
 */
export function LocaleFlag({ locale }: PropsI) {
  return (
    <Image
      src={LOCALE_FLAGS[locale]}
      alt=""
      aria-hidden
      width={20}
      height={14}
      className="h-3.5 w-5 shrink-0 rounded-xs object-cover ring-1 ring-(--color-stamp-divider)"
    />
  );
}
