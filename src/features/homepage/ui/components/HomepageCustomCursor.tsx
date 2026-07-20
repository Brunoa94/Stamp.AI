"use client";

import { useCustomCursor } from "@/hooks/useCustomCursor";

/**
 * HomepageCustomCursor
 *
 * Custom animated cursor for the homepage with a dot and follower ring.
 * Expands when hovering over interactive elements.
 */
export function HomepageCustomCursor() {
  const { cursorRef, followerRef, isHovering, isVisible, isTouchDevice } =
    useCustomCursor();

  // Don't render on touch devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? "hovering" : ""}`}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        ref={followerRef}
        className={`custom-cursor-follower ${isHovering ? "hovering" : ""}`}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  );
}
