"use client";

import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Button } from "@/features/ui/button";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import { InfoTooltip } from "@/features/ui/info-tooltip";
import { PromptInput } from "./PromptInput";
import { PreservationSlider } from "./PreservationSlider";
import { CoinsOverlay } from "../../components/CoinsOverlay/CoinsOverlay";
import { CoinsOverlayShell } from "../../components/CoinsOverlay/CoinsOverlayShell";
import { CoinsDisplay } from "../../components/CoinsDisplay";
import { useSkipGeneration } from "../../../lib/hooks/useSkipGeneration";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";

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

  // Register action for mobile sticky footer (Step 2)
  useRegisterMobileAction(2, {
    action: onGenerate,
    label: isGenerating ? t("generating") : t("generate"),
    disabled: isGenerating || !prompt.trim() || !canGenerate,
    loading: isGenerating,
  });

  return (
    <div className="relative p-6 pb-36 md:pb-6 md:p-10 lg:p-16 xl:p-24 flex flex-col justify-center bg-white">
      <Heading
        as="h2"
        variant="panelTitle"
        className="text-(--color-stamp-chocolate) mb-4 md:mb-6"
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

      {/* Generate Button with Coins Display - hidden on mobile */}
      <div className="hidden md:block space-y-4">
        {isAuthenticated && !isCoinsError && <CoinsDisplay className="justify-end" />}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim() || !canGenerate}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? t("generating") : t("generate")}
        </Button>

        {/* Skip generation option - shown when user can proceed without AI */}
        {canSkip && !showNoCoinsOverlay && (
          <Button
            variant="ghost"
            onClick={handleSkipGeneration}
            className="w-full text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) text-xs font-medium tracking-wide"
          >
            {hasUploadedImage
              ? t("skipWithUploadedImage")
              : t("skipWithCachedImages")}
          </Button>
        )}
      </div>

      {/* Mobile: show coins display above sticky footer */}
      {isAuthenticated && !isCoinsError && (
        <div className="md:hidden mb-4">
          <CoinsDisplay className="justify-center" />
        </div>
      )}
      {canSkip && !showNoCoinsOverlay && (
        <Button
          variant="ghost"
          onClick={handleSkipGeneration}
          className="md:hidden mb-4 w-full text-(--color-stamp-taupe)"
        >
          {hasUploadedImage ? t("skipWithUploadedImage") : t("skipWithCachedImages")}
        </Button>
      )}

      {/* Overlays */}
      {showLoginOverlay && <CoinsOverlay variant="not-logged-in" />}
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
