"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BrutalistSectionHeader } from "../components/BrutalistSectionHeader";
import { Button } from "@/features/ui/button";
import { brutalistFaqs } from "@/features/homepage-brutalist/lib/constants/brutalistContent";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
/**
 * FAQ Section Component
 *
 * Features:
 * - <details> accordion items
 * - Border hover effects (purple/cyan/orange rotation)
 * - Chevron icon rotation on open
 * - Keyboard accessible
 */

export function FaqSection() {
  return (
    <section id="faq" className="relative py-32 px-8 bg-concrete text-ink">
      <BrutalistSectionHeader title="FAQ" label="QUESTIONS_ANSWERED" />

      {/* FAQ accordion */}
      <div className="max-w-4xl mx-auto space-y-4">
        {brutalistFaqs.map((faq) => (
          <details
            key={faq.id}
            id={faq.id}
            className={`group border-2 ${faq.borderColor} p-6 md:p-8 transition-all duration-300 bg-white/50 backdrop-blur-sm`}
          >
            <summary className="flex justify-between items-start cursor-pointer list-none">
              <Heading as="span" variant="question" className="pr-8">
                {faq.question}
              </Heading>
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 shrink-0 group-open:rotate-90 transition-transform duration-300 text-brandPurple mt-1" />
            </summary>
            <Paragraph
              as="div"
              className="mt-6 border-t-2 border-ink/10 pt-6 opacity-70"
            >
              {faq.answer}
            </Paragraph>
          </details>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <Paragraph
          className="font-bold mb-6 opacity-60 tracking-widest"
        >
          Still have questions?
        </Paragraph>
        <Button
          asChild
          variant="outline"
          className="h-auto rounded-none border-2 border-ink bg-transparent px-8 py-3 font-anton text-lg tracking-widest uppercase hover:bg-ink hover:text-concrete transition-all duration-300 shadow-[4px_4px_0px_rgba(10,10,10,0.1)]"
        >
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </section>
  );
}
