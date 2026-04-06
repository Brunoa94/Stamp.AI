export function CreatingTitle() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
        Step 04 · Finalizing
      </span>

      <h2 className="text-3xl sm:text-4xl font-heading font-semibold bg-linear-to-r from-purple-700 via-violet-600 to-indigo-600 dark:from-purple-400 dark:via-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
        Creating Your Product
      </h2>

      <p className="max-w-md text-sm sm:text-base font-accent text-muted-foreground">
        We&apos;re applying your artwork and preparing production-ready
        variants.
      </p>
    </div>
  );
}
