"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CaptchaAction } from "@/lib/security/captcha/constants";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }
}

interface UseCaptchaOptions {
  /** Action identifier for this CAPTCHA instance */
  action: CaptchaAction;
  /** Callback when CAPTCHA is ready */
  onReady?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

interface UseCaptchaReturn {
  /** Whether the CAPTCHA script is loaded and ready */
  isReady: boolean;
  /** Whether a token is being generated */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Get a CAPTCHA token for verification */
  getToken: () => Promise<string | null>;
  /** Execute CAPTCHA and return token (alias for getToken) */
  execute: () => Promise<string | null>;
}

const RECAPTCHA_SCRIPT_ID = "recaptcha-v3-script";

/**
 * Hook for integrating reCAPTCHA v3 in React components
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { isReady, getToken } = useCaptcha({ action: 'login' });
 *
 *   const handleSubmit = async (data: FormData) => {
 *     const captchaToken = await getToken();
 *     if (!captchaToken) {
 *       // Handle error
 *       return;
 *     }
 *
 *     await loginUser({ ...data, captchaToken });
 *   };
 * }
 * ```
 */
export function useCaptcha(options: UseCaptchaOptions): UseCaptchaReturn {
  const { action, onReady, onError } = options;
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep latest callbacks in refs so the effect doesn't re-run when the
  // parent passes new inline function references on every render.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  });

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Load reCAPTCHA script — only re-runs when siteKey changes.
  useEffect(() => {
    // Skip if no site key (development mode)
    if (!siteKey) {
      setIsReady(true);
      onReadyRef.current?.();
      return;
    }

    // Check if script already exists
    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);
    if (existingScript) {
      // Script already loaded, just wait for grecaptcha
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
          onReadyRef.current?.();
        });
      }
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsReady(true);
        onReadyRef.current?.();
      });
    };

    script.onerror = () => {
      const err = new Error("Failed to load reCAPTCHA script");
      setError(err);
      onErrorRef.current?.(err);
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove script as other components might need it
    };
  }, [siteKey]);

  // Get CAPTCHA token
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!siteKey) {
      return null;
    }

    if (!isReady || !window.grecaptcha) {
      setError(new Error("reCAPTCHA not ready"));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (err) {
      const error = err instanceof Error
        ? err
        : new Error("Failed to execute reCAPTCHA");
      setError(error);
      onErrorRef.current?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [siteKey, isReady, action]);

  return {
    isReady,
    isLoading,
    error,
    getToken,
    execute: getToken,
  };
}

export default useCaptcha;
