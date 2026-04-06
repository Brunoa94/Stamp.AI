export function CreatingProgressBar() {
  return (
    <div className="w-full max-w-120 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Progress</span>
        <span className="text-primary">85%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full border border-white/25 bg-white/20 dark:bg-white/10 backdrop-blur-md">
        <div className="h-full rounded-full bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 animate-[creating-progress-fill_3.2s_ease-in-out_infinite_alternate]" />
      </div>

      <p className="text-center text-xs sm:text-sm font-accent text-muted-foreground">
        This may take a few moments while we finalize your product.
      </p>
    </div>
  );
}
