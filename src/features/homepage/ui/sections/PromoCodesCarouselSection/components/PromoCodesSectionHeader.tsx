import { SectionHeader } from "@/features/homepage/ui/components/SectionHeader";

export function PromoCodesSectionHeader() {
  return (
    <SectionHeader
      eyebrow="03 / Promo Codes"
      title="Active deals you can use at checkout."
      description="Copy one code and apply it in your order summary."
      titleSize="xl"
      descriptionClassName="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-slate-500"
    />
  );
}
