"use client";

import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { InfoTooltip } from "@/features/ui/info-tooltip";
import { PromptInput } from "./PromptInput";
import { PreservationSlider } from "./PreservationSlider";
import { CoinsOverlay } from "../../components/CoinsOverlay/CoinsOverlay";
import { CoinsOverlayShell } from "../../components/CoinsOverlay/CoinsOverlayShell";
import { CoinsDisplay } from "../../components/CoinsDisplay";
import { useSkipGeneration } from "../../../lib/hooks/useSkipGeneration";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";
import { SplitToneText } from "../../components/SplitToneText";
import { StampStepTitle } from "../../components/StampStepTitle";
import { StampTitleAccent } from "../../components/StampTitleAccent";

/**
 * SynthesisForm
 *
 * Right panel form with all synthesis controls
 *
 * Coins Integration:
 * - Shows login overlay if not authenticated (with skip option)
 * - Shows no coins overlay if coins depleted (with skip option)
 * - Displays coins count above the title
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
  isCoinsError: boolean;
  onRetryCoins: () => void;
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
  isCoinsError,
  onRetryCoins,
  onPromptChange,
  onPreservationChange,
  onRemoveBackgroundChange,
  onGenerate,
}: PropsI) {
  const t = useTranslations("stamp.synthesis");
  const tCoins = useTranslations("stamp.errors.coins");
  const { handleSkipGeneration, canSkip, hasCachedImages, hasUploadedImage } =
    useSkipGeneration();

  // Determine overlay state (only show after loading is complete)
  const showLoginOverlay = !isAuthLoading && !isAuthenticated;
  const showNoCoinsOverlay =
    !isAuthLoading && isAuthenticated && !isCoinsLoading && !isCoinsError && !hasCoins;
  const canGenerate = isAuthenticated && !isCoinsError && hasCoins;
  // Both overlays cover the form and carry their own skip button.
  const showInlineSkip = canSkip && !showLoginOverlay && !showNoCoinsOverlay;

  // Register action for mobile sticky footer (Step 2)
  useRegisterMobileAction(2, {
    action: onGenerate,
    label: isGenerating ? t("generating") : t("generate"),
    disabled: isGenerating || !prompt.trim() || !canGenerate,
    loading: isGenerating,
  });

  return (
    <div className="relative p-6 pb-36 md:pb-6 md:p-10 lg:p-16 xl:p-24 flex flex-col justify-center bg-(--color-stamp-white) md:bg-transparent">
      {isAuthenticated && !isCoinsError && (
        <CoinsDisplay className="mb-4 w-fit rounded-md border border-(--color-stamp-divider) bg-(--color-stamp-white) px-3 py-1.5 md:mb-6" />
      )}
      <StampStepTitle>
        {t.rich("title", {
          accent: (chunks) => <StampTitleAccent>{chunks}</StampTitleAccent>,
        })}
      </StampStepTitle>

      {/* Form Fields */}
      <div className="space-y-4 md:space-y-8 mb-6 md:mb-12">
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
            className="rounded-sm border-(--color-stamp-taupe) bg-(--color-stamp-white) focus-visible:ring-(--color-stamp-chocolate) data-[state=checked]:border-(--color-stamp-chocolate) data-[state=checked]:bg-(--color-stamp-chocolate) data-[state=checked]:text-(--color-stamp-white)"
          />
          <Label
            htmlFor="removeBackground"
            variant="section"
            className="cursor-pointer"
          >
            <SplitToneText tone="muted">{t("removeBackgroundLabel")}</SplitToneText>
          </Label>
          <InfoTooltip
            content={t("removeBackgroundTooltip")}
            className="rounded-full bg-(--color-stamp-white) p-0.5"
          />
        </div>
      </div>

      {/* Generate Button - hidden on mobile */}
      <div className="hidden md:block space-y-4">
        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim() || !canGenerate}
          className="w-full"
        >
          {isGenerating ? t("generating") : t("generate")}
        </Button>

        {/* Skip generation option - shown when user can proceed without AI */}
        {showInlineSkip && (
          <Button
            variant="ghost-stamp"
            onClick={handleSkipGeneration}
            className="w-full whitespace-normal"
          >
            <SplitToneText tone="muted">
              {hasUploadedImage
                ? t("skipWithUploadedImage")
                : t("skipWithCachedImages")}
            </SplitToneText>
          </Button>
        )}
      </div>

      {showInlineSkip && (
        <Button
          variant="ghost-stamp"
          onClick={handleSkipGeneration}
          className="md:hidden mb-4 w-full whitespace-normal"
        >
          {hasUploadedImage ? t("skipWithUploadedImage") : t("skipWithCachedImages")}
        </Button>
      )}

      {/* Overlays */}
      {showLoginOverlay && (
        <CoinsOverlay
          variant="not-logged-in"
          onSkip={canSkip ? handleSkipGeneration : undefined}
          hasCachedImages={hasCachedImages}
          hasUploadedImage={hasUploadedImage}
        />
      )}
      {!isAuthLoading && isAuthenticated && isCoinsError && (
        <CoinsOverlayShell
          testId="coins-overlay-load-error"
          icon={<AlertCircle className="h-8 w-8 text-(--color-stamp-error)" />}
          iconClassName="bg-(--color-stamp-error)/10"
          title={tCoins("loadFailed")}
          description={tCoins("loadFailedDescription")}
        >
          <Button variant="primary-compact" onClick={onRetryCoins}>{tCoins("retry")}</Button>
        </CoinsOverlayShell>
      )}
      {showNoCoinsOverlay && (
        <CoinsOverlay
          variant="no-coins"
          onSkip={canSkip ? handleSkipGeneration : undefined}
          hasCachedImages={hasCachedImages}
          hasUploadedImage={hasUploadedImage}
        />
      )}
    </div>
  );
}
