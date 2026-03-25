"use client";

import { RefObject } from "react";
import { Loader2, Package, Sparkles } from "lucide-react";
import { colors, animations, componentThemes } from "@/theme";
import clsx from "clsx";

interface ProductCreatingSectionProps {
  sectionRef: RefObject<HTMLElement | null>;
}

// Static creation step configuration outside component
const CREATION_STEPS = [
  { icon: Package, text: "Creating your custom product...", delay: 0 },
  { icon: Sparkles, text: "Applying your design...", delay: 1500 },
  { icon: Package, text: "Setting up variants...", delay: 3000 },
] as const;

export function ProductCreatingSection({
  sectionRef,
}: ProductCreatingSectionProps) {
  return (
    <section
      ref={sectionRef}
      className={componentThemes.loading.section}
      aria-label="Creating product"
      role="status"
      aria-live="polite"
    >
      <div className={clsx(componentThemes.loading.container, animations.fadeIn)}>
        {/* Main Loading Spinner */}
        <div className="flex justify-center">
          <div className={componentThemes.loading.spinnerContainer}>
            <Loader2 className={clsx(componentThemes.loading.mainSpinner, colors.purpleText)} />
            <div className={componentThemes.loading.spinnerInnerIcon}>
              <Package className={clsx(componentThemes.loading.spinnerInnerPackage, colors.purpleText)} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className={componentThemes.loading.title}>Creating Your Product</h2>
          <p className={componentThemes.loading.subtitle}>
            Please wait while we prepare your custom tee...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 pt-4">
          {CREATION_STEPS.map((step, index) => (
            <div
              key={index}
              className={clsx(componentThemes.loading.stepContainer, animations.slideInRight)}
              style={{ animationDelay: `${step.delay}ms` }}
            >
              <step.icon className={clsx(componentThemes.loading.stepIcon, colors.purpleText)} />
              <span className={componentThemes.loading.stepText}>{step.text}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="pt-6">
          <div className={componentThemes.loading.progressBarContainer}>
            <div
              className={clsx(
                componentThemes.loading.progressBarFill,
                colors.purplePrimary,
                animations.progressBar
              )}
            />
          </div>
        </div>

        {/* Encouraging Message */}
        <div className="pt-4">
          <p className={componentThemes.loading.message}>
            Your unique design is almost ready... ✨
          </p>
        </div>
      </div>
    </section>
  );
}
