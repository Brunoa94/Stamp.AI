import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";

/**
 * ProductSpecsList
 *
 * Spec bullets of the selected product. Shows the first three and reveals
 * the rest with a see more / see less toggle, so long specs that wrap are
 * never cut mid-line.
 */

const COLLAPSED_COUNT = 3;

interface PropsI {
  specs: string[];
}

export function ProductSpecsList({ specs }: PropsI) {
  const t = useTranslations("stamp.productSelection");
  const listId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const isCollapsible = specs.length > COLLAPSED_COUNT;
  const visibleSpecs =
    isCollapsible && !isExpanded ? specs.slice(0, COLLAPSED_COUNT) : specs;

  return (
    <div className="w-full mt-6 pt-6 border-t border-(--color-stamp-divider)">
      <List id={listId} className="text-left w-full space-y-2">
        {visibleSpecs.map((spec, index) => (
          <li key={index} className="flex gap-3">
            <Span
              unstyled
              aria-hidden="true"
              className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-(--color-stamp-gold)"
            />
            <Span
              unstyled
              className="font-body text-base leading-relaxed text-(--color-stamp-taupe)"
            >
              {spec}
            </Span>
          </li>
        ))}
      </List>
      {isCollapsible && (
        <Button
          variant="stamp-expand"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className="mt-3 text-sm"
        >
          {isExpanded ? t("seeLess") : t("seeMore")}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
}
