"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Wand2, AlertCircle } from "lucide-react";
import { componentThemes } from "@/theme";

interface PropsI {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

const PromptInput = ({ onSubmit, disabled = false, isProcessing = false }: PropsI) => {
  const [prompt, setPrompt] = useState("");

  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > 150;
  const canSubmit = prompt.trim().length > 0 && !isOverLimit && !disabled && !isProcessing;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  }, [canSubmit, onSubmit, prompt]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const getWordCountColor = () => {
    if (isOverLimit) return "text-red-500";
    if (wordCount > 140) return "text-yellow-500";
    if (wordCount > 100) return "text-blue-500";
    return "text-purple-500";
  };

  const getProgressBarWidth = () => {
    return Math.min((wordCount / 150) * 100, 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Label with animation */}
        <label
          htmlFor="prompt"
          className="flex items-center text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          <Wand2 className="w-5 h-5 mr-2 text-blue-500 animate-[wiggle_0.8s_ease-in-out_infinite]" />
          Describe Your Magical Vision
        </label>

        {/* Textarea with colorful styling */}
        <div className="relative">
          <textarea
            id="prompt"
            value={prompt}
            onChange={handleTextChange}
            disabled={disabled}
            placeholder="Transform this image into a magical fantasy scene with dragons flying over crystal mountains..."
            className={`
              w-full px-5 py-4 rounded-2xl resize-none transition-all duration-300 text-gray-700
              ${disabled
                ? "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                : isOverLimit
                ? "border-2 border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50"
                : "border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm"
              }
              focus:outline-none shadow-lg hover:shadow-xl hover:shadow-blue-500/20
            `}
            rows={5}
            maxLength={1000}
          />

          {/* Sparkle decoration */}
          {!disabled && prompt.length > 0 && (
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-purple-400 animate-pulse" />
          )}
        </div>

        {/* Word count with animated progress bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className={`text-sm font-medium flex items-center ${getWordCountColor()}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isOverLimit ? 'bg-red-400 animate-pulse' : 'bg-current'
              }`}></div>
              {wordCount}/150 words
            </div>

            {isOverLimit && (
              <div className="flex items-center text-red-500 text-xs font-medium animate-[shake_0.5s_ease-in-out]">
                <AlertCircle className="w-3 h-3 mr-1" />
                Keep it under 150 words
              </div>
            )}
          </div>

          {/* Animated progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isOverLimit
                  ? "bg-gradient-to-r from-red-400 to-red-500 animate-pulse"
                  : wordCount > 100
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600"
              }`}
              style={{ width: `${getProgressBarWidth()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Animated submit button */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className={`w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
          canSubmit
            ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-3"></div>
            Creating Magic...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Send className="mr-3 h-5 w-5" />
            <span>Generate Magic ✨</span>
            {canSubmit && (
              <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
            )}
          </div>
        )}
      </Button>

      {/* Helpful tips */}
      {!disabled && wordCount === 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 animate-[fadeIn_0.6s_ease-out]">
          <p className="text-sm text-blue-700 text-center">
            💡 <strong>Tip:</strong> Be specific about colors, styles, mood, and details for the best results!
          </p>
        </div>
      )}
    </form>
  );
};

export default PromptInput;