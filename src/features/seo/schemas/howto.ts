import { SITE_URL } from "../config/site";
import type { HowToStep } from "./types";

export function howToSchema(steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${SITE_URL}/#howto`,
    name: "How to Create Custom AI-Designed Apparel",
    description:
      "Create your own custom t-shirt or hoodie using AI in just a few simple steps. No design skills required.",
    totalTime: "PT10M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    tool: [
      {
        "@type": "HowToTool",
        name: "Web browser",
      },
    ],
    supply: [
      {
        "@type": "HowToSupply",
        name: "Your creative idea or reference image",
      },
    ],
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: {
          "@type": "ImageObject",
          url: step.image,
        },
      }),
    })),
  };
}
