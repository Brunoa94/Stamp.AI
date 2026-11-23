import { useTranslations } from "next-intl";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import { InfoTooltip } from "@/features/ui/info-tooltip";
import { Slider } from "@/features/ui/slider";
import { SplitToneText } from "../../components/SplitToneText";

/**
 * PreservationSlider
 *
 * Slider control for adjusting preservation level
 */

interface PropsI {
  value: number;
  onChange: (value: number) => void;
}

export function PreservationSlider({ value, onChange }: PropsI) {
  const t = useTranslations("stamp.synthesis");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Label htmlFor="preservation" variant="section">
          <SplitToneText tone="muted">{t("preservationLabel")}</SplitToneText>
        </Label>
        <InfoTooltip
          content={t("preservationTooltip")}
          className="rounded-full bg-(--color-stamp-white) p-0.5"
        />
      </div>
      <div className="flex items-center gap-4">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("low")}
        </Span>
        <Slider
          id="preservation"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
          aria-label={t("preservationAria")}
        />
        {/* Sits on the backdrop photo at wide screens: cream there, taupe on the off-white */}
        <Span variant="micro">
          <SplitToneText tone="muted">{t("high")}</SplitToneText>
        </Span>
      </div>
    </div>
  );
}
