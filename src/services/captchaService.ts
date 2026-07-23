import type { CaptchaVerificationResult } from "@/lib/security/captcha/types";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export interface RecaptchaApiResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

/**
 * Call the reCAPTCHA verification API
 */
export async function verifyWithRecaptchaApi(
  token: string,
  secretKey: string
): Promise<RecaptchaApiResponse> {
  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });

  return response.json();
}

/**
 * Validate the reCAPTCHA API response and return a verification result
 */
export function validateRecaptchaResponse(
  data: RecaptchaApiResponse,
  expectedAction?: string,
  minScore: number = 0.5
): CaptchaVerificationResult {
  if (!data.success) {
    return {
      success: false,
      errorCodes: data["error-codes"] || ["unknown-error"],
    };
  }

  if (data.score !== undefined && data.score < minScore) {
    console.warn(`[CAPTCHA] Low score: ${data.score} (threshold: ${minScore})`);
    return {
      success: false,
      score: data.score,
      action: data.action,
      errorCodes: ["score-too-low"],
    };
  }

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
}
