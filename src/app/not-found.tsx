import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

/**
 * NotFound
 *
 * 404 page in the Stamp look: a cream rounded-2xl panel inside the page
 * gutter, under the fixed h-24 header, with the amber accent bar, a large
 * slab-serif "404", the page title and a supporting line.
 */
export default function NotFound() {
  const t = useTranslations("common.notFound");

  return (
    <section className="px-4 pt-28 pb-20 sm:px-6 lg:px-12" aria-label={t("ariaLabel")}>
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center rounded-2xl bg-(--color-stamp-cream) px-6 py-16 text-center animate-in fade-in slide-in-from-bottom-12 duration-1000 sm:px-10 lg:py-20">
        <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
        <Span variant="giant" className="mt-6 block text-(--color-stamp-chocolate)">
          404
        </Span>
        <Heading as="h1" variant="sectionDisplay" className="mt-6 text-(--color-stamp-chocolate)">
          {t("title")}
        </Heading>
        <Paragraph variant="sm" className="mt-4 max-w-xl text-(--color-stamp-taupe)">
          {t("description")}
        </Paragraph>
      </div>
    </section>
  );
}
