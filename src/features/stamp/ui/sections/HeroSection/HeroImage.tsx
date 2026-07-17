import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * HeroImage
 *
 * Displays the hero image with overlay effect
 */

export function HeroImage() {
  const t = useTranslations("stamp.hero");

  return (
    <div className="relative h-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2000&auto=format&fit=crop"
        alt={t("imageAlt")}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-(--color-stamp-chocolate)/10" />
    </div>
  );
}
