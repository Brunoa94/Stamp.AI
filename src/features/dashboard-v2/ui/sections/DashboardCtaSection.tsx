/**
 * DashboardCtaSection
 *
 * Inverted (chocolate) call-to-action card linking to the stamp flow.
 */

import Link from "next/link";
import { ArrowRight, Fingerprint } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export function DashboardCtaSection() {
  return (
    <section className="relative overflow-hidden border border-(--color-stamp-chocolate) bg-(--color-stamp-chocolate) p-8 lg:p-12">
      <Fingerprint
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-(--color-stamp-gold)/10"
      />
      <div className="relative space-y-6">
        <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
        <Heading
          as="h2"
          variant="card"
          className="text-(--color-stamp-off-white)"
        >
          Ready for your next{" "}
          <Span variant="serif" className="text-(--color-stamp-gold)">
            masterpiece
          </Span>
          ?
        </Heading>
        <Span as="p" variant="default" className="text-(--color-stamp-taupe)">
          Initiate a new synthesis protocol
        </Span>
        <Button asChild variant="primary-gold" className="group">
          <Link href="/stamp">
            Stamp it
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
