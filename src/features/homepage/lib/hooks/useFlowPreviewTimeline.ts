"use client";

import { useEffect, useState } from "react";
import { FLOW_TICK_MS } from "@/features/homepage/lib/constants/flowPreview";
import {
  getNextPosition,
  getStepDurationTicks,
} from "@/features/homepage/lib/helpers/flowPreviewFrame";
import type { FlowPositionType } from "@/features/homepage/lib/types/flowPreview";

interface OptionsI {
  promptLength: number;
  /** Ticks only while true (e.g. the player is on screen) */
  isPlaying: boolean;
  /** Reduced motion: never auto-advance, show each step in its finished state */
  isStatic: boolean;
}

/**
 * useFlowPreviewTimeline
 *
 * Drives the looping creation-flow demo: advances one tick every FLOW_TICK_MS
 * and lets the user jump to any step.
 */
export function useFlowPreviewTimeline({ promptLength, isPlaying, isStatic }: OptionsI) {
  const [position, setPosition] = useState<FlowPositionType>({ stepIndex: 0, tick: 0 });

  useEffect(() => {
    if (!isPlaying || isStatic) return;

    const intervalId = setInterval(() => {
      setPosition((prev) => getNextPosition(prev, promptLength));
    }, FLOW_TICK_MS);

    return () => clearInterval(intervalId);
  }, [isPlaying, isStatic, promptLength]);

  const goToStep = (stepIndex: number) => setPosition({ stepIndex, tick: 0 });

  const tick = isStatic
    ? getStepDurationTicks(position.stepIndex, promptLength)
    : position.tick;

  return { stepIndex: position.stepIndex, tick, goToStep };
}
