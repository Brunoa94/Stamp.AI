"use client";

import { useState } from "react";
import ImageUploader from "../imageUploader/ImageUploader";
import PromptInput from "../promptInput/PromptInput";
import DashboardHeader from "../dashboardHeader/DashboardHeader";
import { theme } from "@/theme";
import { Sparkles, Wand2 } from "lucide-react";

const DashboardContent = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!uploadedImage) return;

    setIsProcessing(true);

    // Placeholder for API call
    try {
      console.log("Processing prompt:", prompt);
      console.log("With image:", uploadedImage.name);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error("Error processing request:", error);
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
    </section>
  );
};

export default DashboardContent;