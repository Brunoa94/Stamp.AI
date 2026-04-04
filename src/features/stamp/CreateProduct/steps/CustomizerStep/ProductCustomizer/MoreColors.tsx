import { Button } from "@/features/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MAX_VISIBLE_COLORS } from "./utils/prioritizeAvailableColors";

interface Props {
  hasMore: boolean;
  setIsExpanded: (value: boolean) => void;
  isExpanded: boolean;
  colorsLength: number;
}

const MoreColors = ({
  hasMore,
  setIsExpanded,
  isExpanded,
  colorsLength,
}: Props) => {
  if (!hasMore) return null;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsExpanded(!isExpanded)}
      className="h-auto py-3"
    >
      {isExpanded ? (
        <>
          <ChevronUp className="w-4 h-4" />
          Show Less
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4" />+
          {colorsLength - MAX_VISIBLE_COLORS} More
        </>
      )}
    </Button>
  );
};

export default MoreColors;
