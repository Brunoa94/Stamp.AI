"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getStampSplitTone } from "../helpers/stampSplitToneHelpers";
import type { StampSplitToneT } from "../types/stampTypes";

const BASE_TONE: StampSplitToneT = { kind: "base" };

// Long enough to cover the step slide (700ms) and the backdrop fade (1000ms)
const FOLLOW_TRANSITION_MS = 1100;

// The canvas's sliding container (StampCanvas) and the backdrop (StampBackdrop)
const SLIDER_ATTRIBUTE = "data-stamp-slider";
const BACKDROP_CLASS = "stamp-backdrop";

const sameTone = (a: StampSplitToneT, b: StampSplitToneT) =>
  a.kind === b.kind &&
  (a.kind !== "split" ||
    (b.kind === "split" &&
      Math.abs(a.angleDeg - b.angleDeg) < 0.01 &&
      Math.abs(a.stopPct - b.stopPct) < 0.01));

type SubscriberT = {
  element: HTMLElement;
  onTone: (tone: StampSplitToneT) => void;
};

/**
 * One tracker for every split-tone text on the page: a single set of window
 * listeners and one animation loop that reads all positions in one pass, so
 * dozens of texts cost one layout per frame. It follows only the step slide
 * (`transform` on the slider) and the backdrop fade (`opacity`), not every
 * hover transition on the page.
 */
const subscribers = new Set<SubscriberT>();
let frame = 0;
let followUntil = 0;
let resizeObserver: ResizeObserver | null = null;

function toneOf(element: HTMLElement): StampSplitToneT {
  return getStampSplitTone(element.getBoundingClientRect(), {
    width: window.innerWidth,
    height: window.innerHeight,
  });
}

function measureAll() {
  // Read every position first, then update, so the reads share one layout
  const tones = [...subscribers].map((subscriber) => [subscriber, toneOf(subscriber.element)] as const);
  for (const [subscriber, tone] of tones) subscriber.onTone(tone);
}

function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(measureAll);
}

function follow() {
  measureAll();
  if (performance.now() < followUntil) frame = requestAnimationFrame(follow);
}

function isFollowedTransition(event: Event): boolean {
  const { target } = event;
  if (!(target instanceof Element)) return false;
  const { propertyName } = event as TransitionEvent;
  return (
    (propertyName === "transform" && target.hasAttribute(SLIDER_ATTRIBUTE)) ||
    (propertyName === "opacity" && target.classList.contains(BACKDROP_CLASS))
  );
}

function onTransitionStart(event: Event) {
  if (!isFollowedTransition(event)) return;
  followUntil = performance.now() + FOLLOW_TRANSITION_MS;
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(follow);
}

function onTransitionEnd(event: Event) {
  if (isFollowedTransition(event)) schedule();
}

function start() {
  resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
  window.addEventListener("resize", schedule);
  // The steps scroll inside their sections, so any scroll may move a text
  window.addEventListener("scroll", schedule, true);
  window.addEventListener("transitionstart", onTransitionStart, true);
  window.addEventListener("transitionend", onTransitionEnd, true);
}

function stop() {
  cancelAnimationFrame(frame);
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener("resize", schedule);
  window.removeEventListener("scroll", schedule, true);
  window.removeEventListener("transitionstart", onTransitionStart, true);
  window.removeEventListener("transitionend", onTransitionEnd, true);
}

function subscribe(subscriber: SubscriberT): () => void {
  if (subscribers.size === 0) start();
  subscribers.add(subscriber);
  resizeObserver?.observe(subscriber.element);
  subscriber.onTone(toneOf(subscriber.element));

  return () => {
    subscribers.delete(subscriber);
    resizeObserver?.unobserve(subscriber.element);
    if (subscribers.size === 0) stop();
  };
}

/**
 * Tracks where a text element sits against the stamp canvas backdrop's
 * diagonal edge, so it can be coloured dark on the off-white and light on the
 * photo. Re-measures on resize, on any scroll and every frame while the step
 * slide or the backdrop fade runs.
 */
export function useStampSplitTone<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const [tone, setTone] = useState<StampSplitToneT>(BASE_TONE);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;

    return subscribe({
      element,
      onTone: (next) => setTone((previous) => (sameTone(previous, next) ? previous : next)),
    });
  }, [enabled]);

  return { ref, tone: enabled ? tone : BASE_TONE };
}
