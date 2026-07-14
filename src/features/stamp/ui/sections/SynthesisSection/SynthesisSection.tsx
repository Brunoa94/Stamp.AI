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

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_PROMPT_LENGTH) {
      setPrompt(value);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setPrompt((current) => {
      const next = current.trim() ? `${current.trim()} ${suggestion}` : suggestion;
      return next.slice(0, MAX_PROMPT_LENGTH);
    });
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
      <SynthesisVisual onSelectSuggestion={handleSelectSuggestion} />
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
