"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { mobilePageHeaderTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";

interface MobilePageHeaderProps {
  title: string;
  description?: string;
}

export function MobilePageHeader({
  title,
  description,
}: MobilePageHeaderProps) {
  const router = useRouter();

  return (
    <div className={mobilePageHeaderTheme.root}>
      <div className={mobilePageHeaderTheme.inner}>
        <div className={mobilePageHeaderTheme.row}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className={mobilePageHeaderTheme.backButton}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className={mobilePageHeaderTheme.title}>{title}</h1>
        </div>
        {description && (
          <div className={mobilePageHeaderTheme.descriptionRow}>
            <div
              className={mobilePageHeaderTheme.gradientBar}
              aria-hidden="true"
            />
            <p className={mobilePageHeaderTheme.description}>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
