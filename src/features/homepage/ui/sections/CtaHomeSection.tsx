import Link from "next/link";

export function CtaHomeSection() {
  return (
    <section
      id="cta-home"
      className="relative overflow-hidden border-b border-slate-200 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] py-24 text-white"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border-30 border-white" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full border-30 border-white" />
      </div>

      <div className="relative w-full text-center">
        <h2 className="font-heading text-3xl uppercase tracking-tight md:text-5xl">
          Ready to create your stamp?
        </h2>
        <p className="mt-4 text-sm font-medium opacity-90 md:text-lg">
          Join thousands of creators designing custom apparel with AI-powered
          precision.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/stamp"
            className="glass-card w-full rounded-full border border-white/30 bg-white/90 px-12 py-3 font-heading text-lg uppercase tracking-[0.15em] text-[#7C3AED] transition-all duration-300 hover:bg-slate-900 hover:text-white sm:w-auto"
          >
            Start Designing Now
          </Link>
          <Link
            href="/dashboard"
            className="border-b border-white/40 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-white"
          >
            View Design Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
