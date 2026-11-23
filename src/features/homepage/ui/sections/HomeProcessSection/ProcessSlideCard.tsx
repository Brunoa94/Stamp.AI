/**
 * ProcessSlideCard
 *
 * One step of "The Process" carousel: the step's flow-demo screen above its
 * badge, title and description. Its prominence (opacity, scale) follows how
 * close it is to the scroll position.
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { HomeProcessStepType } from "@/features/homepage/lib/constants/homepageContent";
import type { ProcessSlideEmphasisT } from "@/features/homepage/lib/helpers/processCarousel";
import { ProcessFlowSnapshot } from "./ProcessFlowSnapshot";

interface PropsI {
  step: HomeProcessStepType;
  title: string;
  description: string;
  emphasis: ProcessSlideEmphasisT;
}

export function ProcessSlideCard({ step, title, description, emphasis }: PropsI) {
  const t = useTranslations("home.process");

  return (
    <li
      className="flex w-[min(22.5rem,calc(100vw-3rem))] shrink-0 snap-start origin-center flex-col rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-off-white) p-5 short:p-4 shadow-sm sm:w-106 lg:w-216 lg:flex-row lg:items-center lg:gap-10 lg:p-8"
      style={{ opacity: emphasis.opacity, transform: `scale(${emphasis.scale})` }}
    >
      {/* Flow-demo screen scaled down from its native 40rem; the box matches the scaled window */}
      <div className="mb-5 flex h-74 shrink-0 justify-center overflow-hidden sm:h-89 lg:mb-0 lg:w-96 short:mb-3 short:h-52 sm:short:h-52">
        <ProcessFlowSnapshot
          step={step}
          label={description}
          className="origin-top scale-50 sm:scale-60 short:scale-35 sm:short:scale-35"
        />
      </div>

      <div>
        <Span
          variant="badge"
          className="mb-3 inline-block rounded-full bg-(--color-stamp-gold) px-3 py-1 text-(--color-stamp-chocolate) shadow-sm"
        >
          {t("stepBadge", { number: step.number })}
        </Span>

        <Heading as="h3" variant="section" className="mb-2 text-(--color-stamp-chocolate)">
          {title}
        </Heading>

        <Paragraph
          variant="loose"
          className="text-sm leading-relaxed text-(--color-stamp-chocolate)/75 sm:text-base"
        >
          {description}
        </Paragraph>
      </div>
    </li>
  );
}
