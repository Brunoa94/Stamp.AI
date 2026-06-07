interface ScrollProgressIndicatorProps {
  scrollProgress: number;
  currentSectionIndex: number;
}

export function ScrollProgressIndicator({
  scrollProgress,
  currentSectionIndex,
}: ScrollProgressIndicatorProps) {
  return (
    <div className="fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 md:flex">
      <div className="relative h-12 w-px bg-slate-200">
        <div
          className="absolute left-0 top-0 w-px bg-slate-900 transition-all duration-300"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>
      <span className="origin-left rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
        Stamp.AI // {String(currentSectionIndex + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
