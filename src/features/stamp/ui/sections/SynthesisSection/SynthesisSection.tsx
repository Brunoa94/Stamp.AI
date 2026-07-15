"use client";

import { useState, ChangeEvent } from "react";
import { useStampImageGeneration } from "../../../lib/hooks/useStampImageGeneration";
import { SynthesisVisual } from "./SynthesisVisual";
import { SynthesisForm } from "./SynthesisForm";

/**
 * SynthesisSection
 *
 * Step 2: Descriptive synthesis and configuration
 * Protocol 02 / Logic
 */

const MAX_PROMPT_LENGTH = 500;

export function SynthesisSection() {
  const { handleGenerate: generateImage, isGenerating } =
    useStampImageGeneration();

  const [prompt, setPrompt] = useState("");
  const [preservation, setPreservation] = useState(50);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_PROMPT_LENGTH) {
      setPrompt(value);
    }
  };

  const handleSelectSuggestion = (id: string) => {
    setSelectedSuggestionId(id);
  };

  const handleGenerate = async () => {
    await generateImage({
      prompt,
      preservation,
    });
  };

  return (
    <section
      id="step-2"
      className="h-full grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <SynthesisVisual
        selectedId={selectedSuggestionId}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <SynthesisForm
        prompt={prompt}
        preservation={preservation}
        maxPromptLength={MAX_PROMPT_LENGTH}
        isGenerating={isGenerating}
        onPromptChange={handlePromptChange}
        onPreservationChange={setPreservation}
        onGenerate={handleGenerate}
      />
    </section>
  );
}
