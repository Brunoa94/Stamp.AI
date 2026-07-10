/**
 * HomeFaqSection
 *
 * FAQ accordion built on native <details>/<summary> (keyboard accessible,
 * zero JS) with a contact support CTA.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { HOME_FAQS } from "../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../components/HomeSectionHeader";

export function HomeFaqSection() {
  return (
    <section id="faq" className="px-6 py-24 lg:px-12 xl:px-24">
      <div className="mx-auto max-w-4xl">
        <HomeSectionHeader
          title="Questions"
          accent="answered"
          label="Support Archive"
        />

        <div className="space-y-4">
          {HOME_FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-colors duration-300 open:border-(--color-stamp-gold) hover:border-(--color-stamp-gold)"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 lg:p-8 [&::-webkit-details-marker]:hidden">
                <Heading as="h3" variant="question">
                  {faq.question}
                </Heading>
                <ChevronRight
                  aria-hidden
                  className="h-5 w-5 flex-none text-(--color-stamp-taupe) transition-transform duration-300 group-open:rotate-90 group-open:text-(--color-stamp-gold)"
                />
              </summary>
              <div className="border-t border-(--color-stamp-divider) p-6 lg:p-8">
                <Paragraph variant="faq" className="text-(--color-stamp-taupe)">
                  {faq.answer}
                </Paragraph>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            Still have questions?
          </Paragraph>
          <Button asChild variant="secondary-brown">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
