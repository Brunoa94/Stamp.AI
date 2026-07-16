import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

/**
 * HeroContent
 *
 * Displays the hero text content and call-to-action button
 */

interface PropsI {
  onBegin: () => void;
}

export function HeroContent({ onBegin }: PropsI) {
  return (
    <div className="flex flex-col justify-center p-12 lg:p-24">
      <Heading
        as="h1"
        variant="display"
        className="text-(--color-stamp-chocolate) mb-10"
      >
        Stamp <br />
        <span className="text-(--color-stamp-taupe) italic font-serif lowercase">
          It
        </span>
      </Heading>

      <Paragraph
        variant="lead"
        className="text-(--color-stamp-taupe) mb-12 max-w-lg font-light"
      >
        An advanced neural protocol for aesthetic curation. Translate your
        identity into bespoke permanence through our 8-stage synthesis.
      </Paragraph>

      <div>
        <Button
          onClick={onBegin}
          className="bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase"
          aria-label="Begin Customization Protocol"
        >
          Begin Customization
        </Button>
      </div>
    </div>
  );
}
