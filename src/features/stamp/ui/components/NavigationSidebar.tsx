import { memo } from "react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { STAMP_STEPS } from "../../lib/constants/stampSteps";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import { useStampStepAccessibility } from "../../lib/hooks/useStampSelectors";
import { isStampBackdropVisible } from "../../lib/helpers/stampBackdropHelpers";
import {
  stampSidebarDotVariants,
  stampSidebarEyebrowVariants,
  stampSidebarTextVariants,
  stampSidebarVariants,
} from "../../lib/variants/stampSidebarVariants";

/**
 * NavigationSidebar
 *
 * Fixed sidebar navigation for the Stamp flow.
 * Displays progress through the 8-stage synthesis protocol.
 * Step indicators show progress (navigation is via BackButton component).
 * Off-white on the hero step; from step 01 transparent over the canvas
 * backdrop photo, with light copy. Done and upcoming labels sit at 80% so
 * they keep AA contrast on both (the current step stands out by its larger
 * amber dot, full opacity and shift); done vs upcoming shows in the dot colour.
 */

function NavigationSidebarComponent() {
  const t = useTranslations("stamp");
  const { currentStep } = useStampNavigation();
  const { isStepAccessible } = useStampStepAccessibility();
  const onPhoto = isStampBackdropVisible(currentStep);

  return (
    <aside className={stampSidebarVariants({ onPhoto })}>
      {/* Header: accent bar, eyebrow, title (the Stamp section-header order) */}
      <div className="mb-10 space-y-3">
        <div aria-hidden="true" className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
        <Span as="p" variant="label" className={stampSidebarEyebrowVariants({ onPhoto })}>
          {t("nav.eyebrow")}
        </Span>
        <Heading
          as="h4"
          variant="question"
          className={stampSidebarTextVariants({ onPhoto })}
        >
          {t("nav.title")}
        </Heading>
      </div>

      {/* Step Indicators (display only, navigation via BackButton) */}
      <nav className="space-y-6 flex-1" aria-label={t("nav.stepNavAria")}>
        {STAMP_STEPS.map((step, index) => {
          const stepNumber = index;
          const isActive =
            stepNumber === currentStep ||
            (stepNumber === 0 && currentStep === 0);
          const isCompleted = isStepAccessible(stepNumber) && stepNumber < currentStep;
          const stepTitle = t(`steps.${step.id}.title`);

          return (
            <div
              key={step.id}
              className={`flex items-center justify-start gap-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive ? "opacity-100 -translate-x-2" : "opacity-80"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Dot Indicator */}
              <div
                className={stampSidebarDotVariants({
                  state: isActive ? "active" : isCompleted ? "completed" : "upcoming",
                  onPhoto,
                })}
              />

              {/* Step Label */}
              <Span variant="micro" className={stampSidebarTextVariants({ onPhoto })}>
                {step.number === "00"
                  ? stepTitle
                  : `${step.number} ${stepTitle}`}
              </Span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export const NavigationSidebar = memo(NavigationSidebarComponent);
