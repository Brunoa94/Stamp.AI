interface ProgressBarProps {
  progress: string;
}

/**
 * ProgressBar - Animated progress indicator
 * Shows visual progress with shimmer and glow effects
 */
export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="absolute top-8 left-0 right-0 h-2 -z-10 mx-12 md:mx-16">
      <div
        className="h-full bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 rounded-full shadow-lg relative overflow-hidden transition-all duration-1000 ease-in-out"
        style={{ width: progress }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-[checkout-shimmer_2s_infinite]" />

        {/* Glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-400 to-gray-400 blur-sm opacity-60" />
      </div>
    </div>
  );
}
