"use client";

import { useEffect, useRef } from "react";
import { useStampFlowStore } from "../stores/stampFlowStore";
import { getStoredImages } from "../services/generatedImagesStorage";
import { logStampInfo } from "../helpers/stampLogger";

/**
 * useLoadCachedImages
 *
 * Loads cached generated images from localStorage on mount.
 * Images are stored with a 24-hour TTL and automatically cleaned up when expired.
 */
export function useLoadCachedImages() {
  const hasLoadedRef = useRef(false);
  const setGeneratedResults = useStampFlowStore(
    (state) => state.setGeneratedResults
  );

  useEffect(() => {
    // Only load once per mount
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const cachedImages = getStoredImages();

    if (cachedImages.length > 0) {
      logStampInfo({
        scope: "useLoadCachedImages",
        event: "loaded_cached_images",
        metadata: { count: cachedImages.length },
      });

      setGeneratedResults(cachedImages);
    }
  }, [setGeneratedResults]);
}
