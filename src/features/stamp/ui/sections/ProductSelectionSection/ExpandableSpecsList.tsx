import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { List } from "@/features/ui/list";

/**
 * ExpandableSpecsList
 *
 * The selected product's spec lines, collapsed to the first few with a
 * fade into the card and a "see more" toggle.
 */

const COLLAPSED_HEIGHT = 112;
const SPEC_ROW_HEIGHT = 36;

interface PropsI {
  specs: string[];
}

export function ExpandableSpecsList({ specs }: PropsI) {
  const t = useTranslations("stamp.productSelection");
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full mt-5 pt-5 border-t border-(--color-stamp-divider)">
      <div
        className="relative overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? `${specs.length * SPEC_ROW_HEIGHT}px` : `${COLLAPSED_HEIGHT}px` }}
      >
        <List className="text-left w-full space-y-1.5">
          {specs.map((spec, index) => (
            <li key={index}>
              <Span
                unstyled
                className="font-body text-sm md:text-base leading-relaxed text-(--color-stamp-taupe)"
              >
                {spec}
              </Span>
            </li>
          ))}
        </List>
        {!isExpanded && specs.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-(--color-stamp-white) to-transparent pointer-events-none" />
        )}
      </div>
      {specs.length > 3 && (
        <Button
          variant="stamp-expand"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2"
        >
          {isExpanded ? (
            <>
              {t("seeLess")}
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              {t("seeMore")}
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
