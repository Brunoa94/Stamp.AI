"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseCustomCursorOptions {
  /** Smoothing factor for main cursor (0-1). Default: 0.2 */
  cursorSmoothing?: number;
  /** Smoothing factor for follower (0-1). Default: 0.1 */
  followerSmoothing?: number;
}

interface UseCustomCursorResult {
  /** Ref for the main cursor element */
  cursorRef: RefObject<HTMLDivElement | null>;
  /** Ref for the follower element */
  followerRef: RefObject<HTMLDivElement | null>;
  /** Whether cursor is hovering over an interactive element */
  isHovering: boolean;
  /** Whether cursor is visible (mouse is in viewport) */
  isVisible: boolean;
  /** Whether this is a touch device (cursor should not render) */
  isTouchDevice: boolean;
}

/**
 * Check if an element is interactive (link, button, etc.)
 */
function isInteractiveElement(target: HTMLElement): boolean {
  return (
    target.tagName === "A" ||
    target.tagName === "BUTTON" ||
    !!target.closest("a") ||
    !!target.closest("button") ||
    !!target.closest("[role='button']") ||
    !!target.closest("[data-cursor-hover]")
  );
}

/**
 * Custom hook for animated cursor with follower effect
 * Handles mouse tracking, smooth animation, and hover state detection
 *
 * @param options - Configuration for cursor behavior
 * @returns Object with refs and state for rendering cursor elements
 */
export function useCustomCursor(
  options: UseCustomCursorOptions = {}
): UseCustomCursorResult {
  const { cursorSmoothing = 0.2, followerSmoothing = 0.1 } = options;

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check for touch device on mount
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  // Set up mouse tracking and animation
  useEffect(() => {
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(isInteractiveElement(target));
    };

    const animate = () => {
      // Main cursor with smoothing
      cursorX += (mouseX - cursorX) * cursorSmoothing;
      cursorY += (mouseY - cursorY) * cursorSmoothing;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      // Follower with more lag for elastic effect
      followerX += (mouseX - followerX) * followerSmoothing;
      followerY += (mouseY - followerY) * followerSmoothing;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;

      animationId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleElementHover);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleElementHover);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [isTouchDevice, cursorSmoothing, followerSmoothing]);

  return {
    cursorRef,
    followerRef,
    isHovering,
    isVisible,
    isTouchDevice,
  };
}
