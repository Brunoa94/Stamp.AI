/**
 * HomeCtaSection
 *
 * Inverted chocolate call-to-action: display headline with serif gold
 * accent, primary/outline CTAs and trust indicators.
 */

import Link from "next/link";
import { ArrowRight, Fingerprint } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HOME_CTA_TRUST } from "../../lib/constants/homepageContent";
import { HomeTrustIndicators } from "../components/HomeTrustIndicators";

export function HomeCtaSection() {
  return (
    <section className="relative overflow-hidden bg-(--color-stamp-chocolate) px-6 py-32 lg:px-12 xl:px-24">
      <Fingerprint
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 text-(--color-stamp-gold)/10"
      />
      <div className="relative mx-auto flex max-w-screen-2xl flex-col items-center text-center">
        <div className="mb-10 h-1.5 w-20 bg-(--color-stamp-gold)" />
        <Heading
          as="h2"
          variant="cta"
          className="mb-10 text-(--color-stamp-off-white)"
        >
          Ready to stamp your{" "}
          <Span variant="serif" className="text-(--color-stamp-gold)">
            vision
          </Span>
          ?
        </Heading>

        <Paragraph
          variant="lead"
          className="mb-14 max-w-2xl text-(--color-stamp-taupe)"
        >
          Join thousands of creators using AI-powered design synthesis to
          bring their ideas to life. Start creating archival-quality apparel
          in seconds.
        </Paragraph>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild variant="primary-gold" className="group">
            <Link href="/stamp">
              Start Creating
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="outline-cream">
            <Link href="/products">Browse Catalog</Link>
          </Button>
        </div>

        <HomeTrustIndicators
          items={HOME_CTA_TRUST}
          className="mt-20 justify-center"
        />
      </div>
    </section>
  );
}
