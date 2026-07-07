import { Button } from "@/features/ui/button";

/**
 * ResultsActions
 *
 * Action buttons for using design or re-synthesizing
 */

interface PropsI {
  canProceed: boolean;
  onUseProtocol: () => void;
  onReSynthesize: () => void;
}

export function ResultsActions({
  canProceed,
  onUseProtocol,
  onReSynthesize,
}: PropsI) {
  return (
    <div className="flex gap-6">
      <Button
        onClick={onUseProtocol}
        disabled={!canProceed}
        className="flex-1 bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase"
      >
        USE THIS PROTOCOL
      </Button>
      <Button
        onClick={onReSynthesize}
        className="flex-1 bg-transparent text-(--color-stamp-chocolate) border border-(--color-stamp-divider) hover:bg-(--color-stamp-chocolate) hover:text-white hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase"
      >
        RE-SYNTHESIZE
      </Button>
    </div>
  );
}
