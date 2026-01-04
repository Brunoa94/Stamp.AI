"use client";

import { useState } from "react";
import ImageUploader from "../imageUploader/ImageUploader";
import PromptInput from "../promptInput/PromptInput";
import DashboardHeader from "../dashboardHeader/DashboardHeader";
import { theme } from "@/theme";
import { Sparkles, Wand2 } from "lucide-react";

interface IGeneratedImageResult {
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

const DashboardContent = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<IGeneratedImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setGeneratedResult(null);
    setError(null);
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);
    setGeneratedResult(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("image", uploadedImage);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.success) {
        setGeneratedResult({
          imageUrl: data.imageUrl,
          enhancedPrompt: data.enhancedPrompt,
          originalPrompt: data.originalPrompt,
        });
      }
    } catch (error: any) {
      console.error("Error processing request:", error);
      setError(error.message || "Failed to generate image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto space-y-12" aria-label="AI Magic Studio">
      <DashboardHeader route="dashboard" />

      {/* Main Content Grid */}
      <section className={theme.dashboard.grid} aria-label="Upload and prompt sections">
        {/* Image Upload Section */}
        <article className={`${theme.upload.section} ${theme.animations.slideInLeft}`}>
          <div className={theme.upload.card}>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4 animate-[bounceIn_0.6s_ease-out]">
                1
              </div>
              <h2 className={theme.upload.title}>
                Upload Your Canvas
              </h2>
            </div>
            <ImageUploader
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onRemoveImage={handleRemoveImage}
            />
          </div>
        </article>

        {/* Prompt Input Section */}
        <article className={`${theme.prompt.section} ${theme.animations.slideInRight}`}>
          <div className={theme.prompt.card}>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4 animate-[bounceIn_0.6s_ease-out_0.2s_both]">
                2
              </div>
              <h2 className={theme.prompt.title}>
                Describe Your Vision
              </h2>
            </div>
            <PromptInput
              onSubmit={handlePromptSubmit}
              disabled={!uploadedImage}
              isProcessing={isProcessing}
            />
            {!uploadedImage && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 animate-[fadeIn_0.6s_ease-out]">
                <p className="text-sm text-purple-700 text-center flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upload an image first to unlock the magic! ✨
                </p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Processing Animation */}
      {isProcessing && (
        <section className="text-center py-12 animate-[fadeIn_0.6s_ease-out]" aria-live="polite" aria-label="Processing status">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 animate-spin rounded-full h-24 w-24 border-4 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-border mx-auto"></div>
            {/* Inner spinning circle */}
            <div className="relative animate-pulse rounded-full h-24 w-24 bg-gradient-to-br from-purple-100 to-pink-100 mx-auto flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-purple-600 animate-[wiggle_0.8s_ease-in-out_infinite]" />
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Creating magic... ✨
          </p>
          <div className="mt-4 flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-purple-400 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <section className="text-center py-8 animate-[fadeIn_0.6s_ease-out]" aria-live="polite">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        </section>
      )}

      {/* Generated Image Result */}
      {generatedResult && (
        <section className="space-y-8 animate-[fadeIn_0.8s_ease-out]" aria-label="Generated image result">
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              🎨 Magic Created!
            </h3>
            <p className="text-gray-600">
              Your AI-generated masterpiece is ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Original prompt */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Your Request
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {generatedResult.originalPrompt}
              </p>
            </div>

            {/* Enhanced prompt */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                <Wand2 className="w-4 h-4 mr-2" />
                AI Enhanced Description
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {generatedResult.enhancedPrompt}
              </p>
            </div>
          </div>

          {/* Generated Image */}
          <div className="bg-gradient-to-br from-white via-gray-50/50 to-purple-50/30 rounded-2xl p-8 border border-gray-200 shadow-xl">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src={generatedResult.imageUrl}
                alt="AI Generated Image"
                className="w-full h-auto max-w-2xl mx-auto block rounded-xl"
              />
            </div>
            <div className="mt-6 flex justify-center">
              <a
                href={generatedResult.imageUrl}
                download="ai-generated-image.png"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Download Image 📥
              </a>
            </div>
          </div>
        </section>
      )}
    </section>
  );
};

export default DashboardContent;