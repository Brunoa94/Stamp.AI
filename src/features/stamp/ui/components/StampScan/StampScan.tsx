import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { StampScanLayer } from "./StampScanLayer";

/**
 * StampScan
 *
 * The entry step's animated scene, filling its positioned parent: three
 * columns of shop products drift down through a gold print line across the
 * middle. Above the line every product is blank; whatever passes through it
 * comes out printed, so several products are mid-print at any moment. Two
 * identical layers (blank, then printed clipped below the line) scroll in
 * lockstep. Gold registration marks frame the scene. Static under reduced
 * motion (`.stamp-scan*` in globals.css).
 */
export function StampScan() {
  const t = useTranslations("stamp.hero.scan");

  return (
    <div
      aria-hidden="true"
      className="stamp-scan pointer-events-none absolute inset-0 overflow-hidden bg-(--color-stamp-chocolate)"
    >
      <StampScanLayer srcKey="blankSrc" className="stamp-scan__layer--blank" />
      <StampScanLayer srcKey="printedSrc" className="stamp-scan__layer--printed" />
      <div className="stamp-scan__head absolute inset-x-0" />
      <Span variant="pill" className="stamp-scan__label stamp-scan__label--blank absolute rounded-full border border-(--color-stamp-cream)/60 bg-(--color-stamp-chocolate)/70 text-(--color-stamp-cream)">
        {t("blank")}
      </Span>
      <Span variant="pill" className="stamp-scan__label stamp-scan__label--printed absolute rounded-full bg-(--color-stamp-gold) text-(--color-stamp-chocolate)">
        {t("printed")}
      </Span>
      <div className="stamp-scan__marks absolute" />
    </div>
  );
}
