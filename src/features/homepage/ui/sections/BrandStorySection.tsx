import { trustHighlights } from "@/features/homepage/lib/constants/homepageContent";
import { SectionHeader } from "@/features/homepage/ui/components/SectionHeader";
import { mapTrustHighlightIndexToCardVisual } from "@/features/homepage/lib/mappers/brandStoryCardMapper";

export function BrandStorySection() {
  return (
    <section
      id="brand-story"
      className="relative overflow-hidden bg-linear-to-br from-[#D946EF]/10 via-white to-[#06B6D4]/10 py-24"
    >
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#7C3AED]/18 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-[#06B6D4]/16 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D946EF]/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 ">
        <SectionHeader
          className="mb-8"
          eyebrow="02 / About Stamp.AI"
          title="Democratizing Design Precision."
          titleSize="xl"
          descriptionClassName="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-slate-500"
        />

        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="glass-card relative min-h-80 w-full overflow-hidden rounded-xl lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1964&auto=format&fit=crop"
              alt="Studio"
              className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 hover:scale-105 hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-slate-900/20 transition-colors hover:bg-transparent" />
          </div>

          <div className="w-full lg:w-1/2">
            <p className="mb-10 text-base font-medium italic leading-relaxed text-slate-600">
              "Every garment holds a memory. Stamp.AI exists to make sure the
              designs that carry your stories are produced with the precision
              they deserve — beautifully, effortlessly, every time."
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {trustHighlights.map((item, idx) => {
                const { theme, icon: CardIcon } =
                  mapTrustHighlightIndexToCardVisual(idx);

                return (
                  <article
                    key={item.title}
                    className={`glass-card relative overflow-hidden rounded-xl border bg-linear-to-br p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${theme.gradient} ${theme.border}`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-linear-to-r ${theme.bar}`}
                      aria-hidden="true"
                    />
                    <CardIcon className={`mb-3 h-5 w-5 ${theme.iconColor}`} />
                    <h4 className="font-heading text-xl uppercase text-slate-900">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
