import { ChevronDown } from "lucide-react";
import { SectionHeader } from "@/features/homepage/ui/components/SectionHeader";
import { faqs } from "@/features/homepage/lib/constants/homepageContent";
import { mapFaqIndexToGradient } from "@/features/homepage/lib/mappers/faqCardMapper";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="bg-linear-to-br from-[#FF8C42]/8 via-white to-[#7C3AED]/8 py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6 ">
        <SectionHeader
          className="mb-8"
          eyebrow="04 / Frequently Asked Questions"
          title="Curated Knowledge."
          description="Everything you need to know about the Stamp.AI engine."
          titleSize="xl"
          descriptionClassName="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-slate-500"
        />

        <div className="space-y-4">
          {faqs.slice(0, 4).map((faq, idx) => {
            const faqGradient = mapFaqIndexToGradient(idx);

            return (
              <details
                key={faq.q}
                className={`glass-card group overflow-hidden rounded-xl border border-white/60 bg-linear-to-br ${faqGradient}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                  <h4 className="font-heading text-sm uppercase tracking-wide text-slate-900">
                    {faq.q}
                  </h4>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {faq.a}
                  </p>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
