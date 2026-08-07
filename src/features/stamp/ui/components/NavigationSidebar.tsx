import { memo } from "react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { STAMP_STEPS } from "../../lib/constants/stampSteps";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import { useStampStepAccessibility } from "../../lib/hooks/useStampSelectors";

/**
 * NavigationSidebar
 *
 * Fixed sidebar navigation for the Stamp flow.
 * Displays progress through the 8-stage synthesis protocol.
 * Step indicators show progress (navigation is via BackButton component).
 */

function NavigationSidebarComponent() {
  const t = useTranslations("stamp");
  const { currentStep } = useStampNavigation();
  const { isStepAccessible } = useStampStepAccessibility();

  return (
    <aside className="hidden lg:flex flex-col py-32 px-10 w-68 h-full fixed right-0 top-24 bg-(--color-stamp-off-white) border-l border-(--color-stamp-divider) z-40">
      {/* Header */}
      <div className="mb-16">
        <Heading
          as="h4"
          variant="question"
          className="text-(--color-stamp-chocolate)"
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
                isActive
                  ? "opacity-100 -translate-x-2"
                  : isCompleted
                    ? "opacity-50"
                    : "opacity-15"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Dot Indicator */}
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-(--color-stamp-gold) shadow-[0_0_15px_var(--color-stamp-gold)]"
                    : isCompleted
                      ? "bg-(--color-stamp-chocolate)"
                      : "bg-(--color-stamp-divider)"
                }`}
              />

              {/* Step Label */}
              <Span variant="micro" className="text-(--color-stamp-chocolate)">
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
