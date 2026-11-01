/**
 * useSinglePaymentAttempt
 *
 * Runs one payment attempt at a time. React state (`isPending`, a disabled
 * button) only updates after a render, so two fast clicks can both start a
 * payment; this guard is a ref, so the second click is ignored synchronously.
 */

"use client";

import { useRef } from "react";

export function useSinglePaymentAttempt() {
  const running = useRef(false);

  return async function runPaymentAttempt<ResultT>(
    attempt: () => Promise<ResultT>,
  ): Promise<ResultT | undefined> {
    if (running.current) return undefined;
    running.current = true;
    try {
      return await attempt();
    } finally {
      running.current = false;
    }
  };
}
