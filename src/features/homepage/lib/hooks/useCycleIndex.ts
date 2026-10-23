"use client";

import { useEffect, useState } from "react";

/**
 * useCycleIndex
 *
 * Steps an index through 0…length-1 every `intervalMs`, looping.
 * Stays put while `isPaused` (e.g. reduced motion).
 */
export function useCycleIndex(length: number, intervalMs: number, isPaused: boolean): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [length, intervalMs, isPaused]);

  return index;
}
