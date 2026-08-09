"use client";

import { useState, useCallback, ChangeEvent, memo } from "react";
import { useStampImageGeneration } from "../../../lib/hooks/useStampImageGeneration";
import { useUser } from "@/queries/authQueries";
import { useUserCoins } from "@/queries/coinsQueries";
import { SynthesisVisual } from "./SynthesisVisual";
import { SynthesisForm } from "./SynthesisForm";

/**
 * SynthesisSection
 *
 * Step 2: Descriptive synthesis and configuration
 * Protocol 02 / Logic
 *
 * Coins Integration:
 * - Checks authentication state
 * - Checks coins balance
 * - Shows overlay if not authenticated or no coins
 */

const MAX_PROMPT_LENGTH = 500;

function SynthesisSectionComponent() {
  const { handleGenerate: generateImage, isGenerating } =
    useStampImageGeneration();

  // Auth and coins state
  const { data: user, isLoading: isAuthLoading } = useUser();
  const { data: coinsData, isLoading: isCoinsLoading } = useUserCoins();

  const isAuthenticated = !!user;
  const coins = coinsData?.coins ?? 0;
  const hasCoins = coins > 0;

  const [prompt, setPrompt] = useState("");
  const [preservation, setPreservation] = useState(50);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null);

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_PROMPT_LENGTH) {
        setPrompt(value);
      }
    },
    [],
  );

  const handleSelectSuggestion = useCallback((id: string) => {
    setSelectedSuggestionId(id);
  }, []);

  const handleGenerate = useCallback(async () => {
    await generateImage({
      prompt,
      preservation,
      removeBackground,
    });
  }, [generateImage, prompt, preservation, removeBackground]);

  return (
    <section
      id="step-2"
      className="h-full overflow-y-auto grid grid-cols-1 md:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <SynthesisVisual
        selectedId={selectedSuggestionId}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <SynthesisForm
        prompt={prompt}
        preservation={preservation}
        removeBackground={removeBackground}
        maxPromptLength={MAX_PROMPT_LENGTH}
        isGenerating={isGenerating}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        hasCoins={hasCoins}
        isCoinsLoading={isCoinsLoading}
        onPromptChange={handlePromptChange}
        onPreservationChange={setPreservation}
        onRemoveBackgroundChange={setRemoveBackground}
        onGenerate={handleGenerate}
      />
    </section>
  );
}

export const SynthesisSection = memo(SynthesisSectionComponent);
