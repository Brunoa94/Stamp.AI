"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type {
  PrintPositionConfigType,
  SockFaceType,
} from "../../../lib/types/stampFlowTypes";

/**
 * SockFaceSelector
 *
 * Socks-only placement control: for each enabled leg, choose whether the
 * design prints on the front or the back of the leg. Defaults to back.
 * The chosen face maps to a placement preset that is sent to Printify.
 */

const FACES: SockFaceType[] = ["front", "back"];

interface PropsI {
  positions: string[];
  printPositionConfigs: Record<string, PrintPositionConfigType>;
  onFaceChange: (position: string, face: SockFaceType) => void;
  disabled?: boolean;
}

export function SockFaceSelector({
  positions,
  printPositionConfigs,
  onFaceChange,
  disabled = false,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  if (positions.length === 0) return null;

  return (
    <div>
      <Span
        variant="micro"
        className="mb-1 block tracking-widest text-(--color-stamp-taupe)"
      >
        {t("faceTitle")}
      </Span>
      <Span
        variant="micro"
        className="mb-4 block text-[9px] normal-case tracking-normal text-(--color-stamp-taupe)/60"
      >
        {t("faceHelp")}
      </Span>

      <div className="space-y-3">
        {positions.map((position) => {
          const config = printPositionConfigs[position];
          if (!config?.enabled) return null;
          const activeFace: SockFaceType = config.face ?? "back";
          const positionLabel = t(`position.${position}`);

          return (
            <div key={position} className="flex items-center justify-between gap-4">
              <Span variant="micro" className="text-(--color-stamp-chocolate)">
                {positionLabel}
              </Span>
              <div className="flex items-center gap-2" role="group">
                {FACES.map((face) => {
                  const isActive = activeFace === face;
                  return (
                    <Button
                      key={face}
                      variant="ghost"
                      disabled={disabled}
                      aria-pressed={isActive}
                      aria-label={t("faceAria", {
                        face: t(`face.${face}`),
                        position: positionLabel,
                      })}
                      onClick={() => onFaceChange(position, face)}
                      className={`h-9 rounded-none border px-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        isActive
                          ? "border-(--color-stamp-gold) bg-(--color-stamp-gold)/5 text-(--color-stamp-chocolate)"
                          : "border-(--color-stamp-divider) text-(--color-stamp-taupe) hover:border-(--color-stamp-gold)"
                      }`}
                    >
                      {t(`face.${face}`)}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
