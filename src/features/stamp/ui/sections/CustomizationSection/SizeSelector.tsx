import { useTranslations } from "next-intl";
import { Label } from "@/features/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import type { SizeType } from "../../../lib/types/stampTypes";
import { useSizeLabel } from "../../../lib/hooks/useSizeLabel";
import { SplitToneText } from "../../components/SplitToneText";

/**
 * SizeSelector
 *
 * Size selection component with dropdown select
 */

interface PropsI {
  sizes: SizeType[];
  selectedSize: SizeType;
  onSelectSize: (size: SizeType) => void;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
}: PropsI) {
  const t = useTranslations("stamp.customization");
  const { formatSize } = useSizeLabel();

  return (
    <div>
      <Label htmlFor="size-select" variant="section" className="mb-3">
        <SplitToneText tone="muted">{t("sizeSelectorLabel")}</SplitToneText>
      </Label>
      <Select
        value={selectedSize}
        onValueChange={(value) => onSelectSize(value as SizeType)}
      >
        <SelectTrigger
          id="size-select"
          aria-label={t("sizeSelectionAria")}
          className="h-auto w-full rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 py-3 text-sm font-medium text-(--color-stamp-chocolate) shadow-none focus:border-(--color-stamp-chocolate) focus:ring-(--color-stamp-chocolate)"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size} value={size}>
              {formatSize(size)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
