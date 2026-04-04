interface HeroSectionProps {
  heroScale: number;
}

export function HeroSection({ heroScale }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative flex h-dvh items-center justify-center overflow-hidden border-b border-slate-200"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 z-0 h-96 w-96 rounded-full bg-[#FF8C42]/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 z-0 h-96 w-96 rounded-full bg-[#06B6D4]/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-0 opacity-35 grayscale transition-all duration-1000 hover:grayscale-0">
        <div className="absolute inset-0 bg-linear-to-br from-[#7C3AED]/35 via-transparent to-slate-900/25 mix-blend-multiply" />
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
          alt="Stamp AI brand studio"
          className="h-full w-full scale-110 object-cover"
        />
      </div>

      <div className="relative z-10 text-center">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -translate-x-2 -translate-y-2 font-heading text-[10vw] uppercase leading-[0.88] tracking-tight text-slate-900/10 select-none">
            STAMP.AI
          </div>
          <div className="pointer-events-none absolute inset-0 -translate-x-1 -translate-y-1 font-heading text-[10vw] uppercase leading-[0.88] tracking-tight text-slate-900/15 select-none">
            STAMP.AI
          </div>
          <h1
            className="font-heading text-[10vw] uppercase leading-[0.88] tracking-tight transition-transform duration-300"
            style={{ transform: `scale(${heroScale})` }}
          >
            <span className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
              STAMP
            </span>
            <span className="bg-linear-to-r from-[#7C3AED] via-[#FF8C42] to-[#06B6D4] bg-clip-text text-transparent">
              .AI
            </span>
          </h1>
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-slate-500 md:text-sm">
          Create Your Stamp
        </p>

        <div className="mt-12 flex animate-bounce flex-col items-center">
          <span className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Scroll to Build
          </span>
          <div className="h-12 w-px bg-slate-900/25" />
        </div>
      </div>
    </section>
  );
}
