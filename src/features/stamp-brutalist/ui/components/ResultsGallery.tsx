
"use client";

import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { useStampFlowStore } from "../../lib/context/StampFormContext";

const MAX_VISIBLE_RESULTS = 6;

interface ArchiveThumbnailProps {
  imageUrl: string;
  index: number;
  onSelect: (url: string) => void;
}

function ArchiveThumbnail({
  imageUrl,
  index,
  onSelect,
}: ArchiveThumbnailProps) {
  return (
    <Button
      type="button"
      onClick={() => onSelect(imageUrl)}
      className="h-auto rounded-none aspect-square object-cover border border-ink/10 grayscale hover:grayscale-0 transition-all cursor-pointer overflow-hidden p-0"
    >
      <img
        src={imageUrl}
        alt={`Generated design ${index + 1}`}
        className="w-full h-full object-cover"
      />
    </Button>
  );
}

export function ResultsGallery() {
  const generatedResults = useStampFlowStore((s) => s.generatedResults);
  const setSelectedImageUrl = useStampFlowStore((s) => s.setSelectedImageUrl);

  if (generatedResults.length === 0) {
    return null;
  }

  const visibleResults = generatedResults.slice(0, MAX_VISIBLE_RESULTS);

  return (
    <div className="space-y-4">
      <Heading variant="card" className="tracking-tight">
        Archive
      </Heading>

      <div className="grid grid-cols-3 gap-2">
        {visibleResults.map((result, index) => (
          <ArchiveThumbnail
            key={`${result.imageUrl}-${index}`}
            imageUrl={result.imageUrl}
            index={index}
            onSelect={setSelectedImageUrl}
          />
        ))}
      </div>
    </div>
  );
}
