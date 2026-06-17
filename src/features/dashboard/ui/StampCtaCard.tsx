import Link from "next/link";
import { Fingerprint } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";

export function StampCtaCard() {
  return (
    <section className="relative p-8 md:p-12 text-white flex flex-col items-start justify-between gap-6 min-h-70 overflow-hidden bg-linear-to-br from-purple via-cyan to-[#d4a76a]">
      <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
        <Fingerprint className="w-48 h-48 md:w-64 md:h-64" />
      </div>

      <div className="relative z-10">
        <Heading as="h2" variant="section" className="font-anton text-4xl md:text-5xl uppercase tracking-tighter leading-tight mb-4">
          READY FOR YOUR NEXT<br />MASTERPIECE?
        </Heading>
        <Paragraph variant="sm" className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-90 max-w-xl leading-relaxed">
          ACCESS HIGH-FIDELITY PRODUCTION TOOLS AND BEGIN<br />YOUR NEXT SYNTHESIS PROTOCOL INSTANTLY.
        </Paragraph>
      </div>

      <Button
        asChild
        variant="default"
        className="relative z-10 px-8 py-4 bg-white text-ink font-anton text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        <Link href="/stamp">
          STAMP IT!
        </Link>
      </Button>
    </section>
  );
}
