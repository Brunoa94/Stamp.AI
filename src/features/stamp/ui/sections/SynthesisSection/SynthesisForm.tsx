import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Button } from "@/features/ui/button";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import { InfoTooltip } from "@/features/ui/info-tooltip";
import { PromptInput } from "./PromptInput";
import { PreservationSlider } from "./PreservationSlider";
import { CoinsOverlay } from "../../components/CoinsOverlay";
import { CoinsDisplay } from "../../components/CoinsDisplay";
import { useSkipGeneration } from "../../../lib/hooks/useSkipGeneration";

/**
 * SynthesisForm
 *
 * Right panel form with all synthesis controls
 *
 * Coins Integration:
 * - Shows login overlay if not authenticated
 * - Shows no coins overlay if coins depleted (with skip option)
 * - Displays coins count near Generate button
 * - Disables Generate button if no coins or not authenticated
 */

interface PropsI {
  prompt: string;
  preservation: number;
  removeBackground: boolean;
  maxPromptLength: number;
  isGenerating: boolean;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  hasCoins: boolean;
  isCoinsLoading: boolean;
  onPromptChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onPreservationChange: (value: number) => void;
  onRemoveBackgroundChange: (value: boolean) => void;
  onGenerate: () => void;
}

export function SynthesisForm({
  prompt,
  preservation,
  removeBackground,
  maxPromptLength,
  isGenerating,
  isAuthenticated,
  isAuthLoading,
  hasCoins,
  isCoinsLoading,
  onPromptChange,
  onPreservationChange,
  onRemoveBackgroundChange,
  onGenerate,
}: PropsI) {
  const t = useTranslations("stamp.synthesis");
  const { handleSkipGeneration, canSkip, hasCachedImages } = useSkipGeneration();

  // Determine overlay state (only show after loading is complete)
  const showLoginOverlay = !isAuthLoading && !isAuthenticated;
  const showNoCoinsOverlay = !isAuthLoading && isAuthenticated && !isCoinsLoading && !hasCoins;
  const canGenerate = isAuthenticated && hasCoins;

  return (
    <div className="relative p-12 lg:p-24 flex flex-col justify-center bg-white">
      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span variant="serif" className="text-(--color-stamp-taupe)">
              {chunks}
            </Span>
          ),
        })}
      </Heading>

      {/* Form Fields */}
      <div className="space-y-8 mb-12">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
          maxLength={maxPromptLength}
        />
        <PreservationSlider
          value={preservation}
          onChange={onPreservationChange}
        />
        <div className="flex items-center gap-3">
          <Checkbox
            id="removeBackground"
            checked={removeBackground}
            onCheckedChange={(checked) =>
              onRemoveBackgroundChange(checked === true)
            }
            aria-label={t("removeBackgroundAria")}
            className="data-[state=checked]:bg-(--color-stamp-gold) data-[state=checked]:border-(--color-stamp-gold)"
          />
          <Label
            htmlFor="removeBackground"
            className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) cursor-pointer"
          >
            {t("removeBackgroundLabel")}
          </Label>
          <InfoTooltip content={t("removeBackgroundTooltip")} />
        </div>
      </div>

      {/* Generate Button with Coins Display */}
      <div className="space-y-4">
        {isAuthenticated && <CoinsDisplay className="justify-end" />}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim() || !canGenerate}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? t("generating") : t("generate")}
        </Button>
      </div>

      {/* Overlays */}
      {showLoginOverlay && <CoinsOverlay variant="not-logged-in" />}
      {showNoCoinsOverlay && (
        <CoinsOverlay
          variant="no-coins"
          onSkip={canSkip ? handleSkipGeneration : undefined}
          hasCachedImages={hasCachedImages}
        />
      )}
    </div>
  );
}
