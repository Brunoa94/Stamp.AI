import { Settings } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import { Span } from "@/features/ui/span";
import { BrutalistCard } from "./BrutalistCard";
import { calculatePercentage } from "../lib/helpers/calculatePercentage";

interface PropsI {
  designsCreated: number;
  archiveLimit?: number;
}

export function ArchiveStorageCard({
  designsCreated,
  archiveLimit = 300,
}: PropsI) {
  const percentage = calculatePercentage(designsCreated, archiveLimit);

  return (
    <BrutalistCard accentColor="cyan">
      <div className="flex items-center justify-between mb-6">
        <Span variant="micro" className={dashboardTheme.card.subtitle}>
          ARCHIVE STORAGE
        </Span>
        <Settings className="w-4 h-4 text-cyan" />
      </div>

      <div className="mb-6">
        <Span variant="metric" className="text-ink mb-2 block">
          {designsCreated}
        </Span>
        <Span variant="micro" className="text-ink/30">
          DESIGNS CREATED
        </Span>
      </div>

      <div className="space-y-2">
        <div className="dashboard-progress-bar">
          <div
            className="dashboard-progress-fill bg-linear-to-r from-cyan to-purple"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <Span variant="micro" className="text-ink/40">
            ARCHIVE LIMIT {archiveLimit}
          </Span>
          <Span variant="micro" className="text-orange">
            {percentage}% UTILIZED
          </Span>
        </div>
      </div>
    </BrutalistCard>
  );
}
