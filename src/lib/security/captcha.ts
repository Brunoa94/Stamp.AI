/**
 * CAPTCHA Integration (Google reCAPTCHA v3)
 *
 * reCAPTCHA v3 provides invisible bot detection by scoring user behavior.
 * No user interaction required - works automatically in the background.
 *
 * Setup:
 * 1. Get keys from: https://www.google.com/recaptcha/admin
 * 2. Add to .env.local:
 *    - NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
 *    - RECAPTCHA_SECRET_KEY=your_secret_key
 *
 * Usage:
 * - Client: Use useCaptcha hook to get token
 * - Server: Use verifyCaptcha to validate token
 */

export interface CaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  challengeTimestamp?: string;
  hostname?: string;
  errorCodes?: string[];
}

/**
 * Verify a reCAPTCHA token on the server side
 *
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The action name that should match (optional)
 * @param minScore - Minimum acceptable score (0.0 to 1.0, default 0.5)
 * @returns Verification result with success status and score
 */
export async function verifyCaptcha(
  token: string,
  expectedAction?: string,
  minScore: number = 0.5
): Promise<CaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // If no secret key configured, skip verification (development mode)
  if (!secretKey) {
    console.warn("[CAPTCHA] No secret key configured, skipping verification");
    return {
      success: true,
      score: 1.0,
      action: expectedAction,
    };
  }

  if (!token) {
    return {
      success: false,
      errorCodes: ["missing-input-response"],
    };
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();

    // Check basic success
    if (!data.success) {
      return {
        success: false,
        errorCodes: data["error-codes"] || ["unknown-error"],
      };
    }

    // Check score threshold
    if (data.score < minScore) {
      console.warn(`[CAPTCHA] Low score: ${data.score} (threshold: ${minScore})`);
      return {
        success: false,
        score: data.score,
        action: data.action,
        errorCodes: ["score-too-low"],
      };
    }

    // Check action matches if specified
    if (expectedAction && data.action !== expectedAction) {
      console.warn(
        `[CAPTCHA] Action mismatch: expected ${expectedAction}, got ${data.action}`
      );
      return {
        success: false,
        score: data.score,
        action: data.action,
        errorCodes: ["action-mismatch"],
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
      challengeTimestamp: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (error) {
    console.error("[CAPTCHA] Verification error:", error);
    return {
      success: false,
      errorCodes: ["verification-failed"],
    };
  }
}

/**
 * CAPTCHA action identifiers for different flows
 */
export const CAPTCHA_ACTIONS = {
  LOGIN: "login",
  REGISTER: "register",
  PASSWORD_RESET: "password_reset",
  CHECKOUT: "checkout",
  CONTACT: "contact",
  IMAGE_GENERATION: "image_generation",
} as const;

export type CaptchaAction = (typeof CAPTCHA_ACTIONS)[keyof typeof CAPTCHA_ACTIONS];

/**
 * Score thresholds for different risk levels
 * Higher scores = more likely to be human
 */
export const CAPTCHA_THRESHOLDS = {
  /** Low risk actions (viewing content) */
  LOW: 0.3,
  /** Medium risk actions (standard forms) */
  MEDIUM: 0.5,
  /** High risk actions (auth, payments) */
  HIGH: 0.7,
  /** Critical actions (password changes) */
  CRITICAL: 0.8,
} as const;

/**
 * Get the appropriate threshold for an action
 */
export function getThresholdForAction(action: CaptchaAction): number {
  switch (action) {
    case "login":
    case "register":
    case "password_reset":
      return CAPTCHA_THRESHOLDS.HIGH;
    case "checkout":
      return CAPTCHA_THRESHOLDS.HIGH;
    case "image_generation":
      return CAPTCHA_THRESHOLDS.MEDIUM;
    case "contact":
      return CAPTCHA_THRESHOLDS.MEDIUM;
    default:
      return CAPTCHA_THRESHOLDS.MEDIUM;
  }
}

/**
 * Verify CAPTCHA with action-appropriate threshold
 */
export async function verifyCaptchaForAction(
  token: string,
  action: CaptchaAction
): Promise<CaptchaVerificationResult> {
  const threshold = getThresholdForAction(action);
  return verifyCaptcha(token, action, threshold);
}
