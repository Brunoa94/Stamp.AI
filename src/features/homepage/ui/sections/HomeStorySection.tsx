/**
 * HomeStorySection
 *
 * Alternating image + text splits telling the Stamp AI story: AI design,
 * heavyweight quality and made-to-order production. Blocks with several
 * images render them as a 2x2 style collage.
 */

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import {
  HOME_STORY_BLOCKS,
  type HomeStoryBlockType,
} from "../../lib/constants/homepageContent";
import { SectionReveal } from "../components/SectionReveal";

function StoryBlockImages({ block, alt }: { block: HomeStoryBlockType; alt: string }) {
  if (block.images.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {block.images.map((src, index) => (
          <div
            key={src}
            className="relative aspect-4/5 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white)"
          >
            <Image
              src={src}
              alt={index === 0 ? alt : ""}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative aspect-4/5 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white)">
      <Image
        src={block.images[0]}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}

export function HomeStorySection() {
  const t = useTranslations("home.story");

  return (
    <section id="about" className="bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24">
      <div className="mx-auto max-w-screen-2xl space-y-24 lg:space-y-32">
        {HOME_STORY_BLOCKS.map((block) => (
          <SectionReveal key={block.id} fadeOnScroll>
            <article className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <div
                className={cn(
                  block.imagePosition === "left" && "lg:order-first",
                  block.imagePosition === "right" && "lg:order-last"
                )}
              >
                <StoryBlockImages
                  block={block}
                  alt={t(`blocks.${block.id}.imageAlt`)}
                />
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-1.5 w-12 bg-(--color-stamp-gold)" />
                  <Span
                    variant="micro"
                    className="uppercase tracking-widest text-(--color-stamp-taupe)"
                  >
                    {t(`blocks.${block.id}.eyebrow`)}
                  </Span>
                </div>

                <Heading
                  as="h2"
                  variant="section"
                  className="mb-8 text-4xl text-(--color-stamp-chocolate) md:text-5xl lg:text-6xl"
                >
                  {t.rich(`blocks.${block.id}.title`, {
                    accent: (chunks) => (
                      <Span
                        variant="serif"
                        className="text-(--color-stamp-taupe)"
                      >
                        {chunks}
                      </Span>
                    ),
                  })}
                </Heading>

                <Paragraph
                  variant="loose"
                  className="mb-10 max-w-xl text-(--color-stamp-taupe)"
                >
                  {t(`blocks.${block.id}.body`)}
                </Paragraph>

                <Link
                  href={block.href}
                  className="group inline-flex items-center gap-2 text-(--color-stamp-chocolate) transition-colors duration-300 hover:text-(--color-stamp-gold)"
                >
                  <Span variant="default">{t(`blocks.${block.id}.cta`)}</Span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
