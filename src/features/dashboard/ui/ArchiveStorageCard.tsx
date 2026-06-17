import { Box } from "lucide-react";
import { dashboardTheme } from "@/theme/components";

interface PropsI {
  designsCreated: number;
  archiveLimit?: number;
}

export function ArchiveStorageCard({
  designsCreated,
  archiveLimit = 300,
}: PropsI) {
  const percentage = Math.min(100, Math.round((designsCreated / archiveLimit) * 100));

  return (
    <section className={`${dashboardTheme.card.baseCyan} hover:shadow-[0_20px_40px_rgba(6,182,212,0.1)]`}>
      {/* Header with Icon */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.4em]">
          ARCHIVE STORAGE
        </span>
        <Box className="w-5 h-5 text-cyan shadow-sm" />
      </div>

      {/* Large Number Display */}
      <h3 className="font-anton text-5xl mb-2 text-ink">{designsCreated}</h3>
      <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-8">
        DESIGNS CREATED
      </p>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-concrete">
          <div
            className="h-full bg-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase">
          <span>ARCHIVE LIMIT {archiveLimit}</span>
          <span className="text-cyan">{percentage}% UTILIZED</span>
        </div>
      </div>
    </section>
  );
}
