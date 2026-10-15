import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export default function NotFound() {
  const t = useTranslations("common.notFound");

  return (
    <section className="pt-32 relative flex items-center justify-center px-12 md:px-24" aria-label={t("ariaLabel")}>
      <div className="w-full max-w-4xl text-center space-y-0 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="mb-12">
          <Span variant="default" className="lost-icon-404 text-[#7C3AED] mb-6 inline-block" aria-hidden="true">
            <HelpCircle className="w-16 h-16 md:w-20 md:h-20" />
          </Span>
          <Heading as="h1" variant="spaced" className="bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">
            {t("title")}
          </Heading>
        </div>

        <div className="relative inline-block mb-0">
          <Span variant="giant" className="block absolute inset-0 text-slate-900 opacity-10 blur-xl select-none">404</Span>
          <Span variant="giant" className="block relative z-10 text-slate-900 glitch-text-404">404</Span>
        </div>
      </div>
    </section>
  );
}
