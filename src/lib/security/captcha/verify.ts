import type { CaptchaVerificationResult } from "./types";
import { type CaptchaAction, getThresholdForAction } from "./constants";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

interface RecaptchaApiResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

async function callRecaptchaApi(
  token: string,
  secretKey: string,
): Promise<RecaptchaApiResponse> {
  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: secretKey, response: token }),
  });
  return response.json() as Promise<RecaptchaApiResponse>;
}

function parseApiResponse(
  data: RecaptchaApiResponse,
  expectedAction?: string,
  minScore: number = 0.5,
): CaptchaVerificationResult {
  if (!data.success) {
    return {
      success: false,
      errorCodes: data["error-codes"] ?? ["unknown-error"],
    };
  }
  if (data.score !== undefined && data.score < minScore) {
    return {
      success: false,
      score: data.score,
      action: data.action,
      errorCodes: ["score-too-low"],
    };
  }
  if (expectedAction && data.action !== expectedAction) {
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

/**
 * Verify a reCAPTCHA token on the server side.
 *
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The action name that should match (optional)
 * @param minScore - Minimum acceptable score (0.0–1.0, default 0.5)
 */
export async function verifyCaptcha(
  token: string,
  expectedAction?: string,
  minScore: number = 0.5,
): Promise<CaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return { success: false, errorCodes: ["missing-secret-key"] };
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const data = await callRecaptchaApi(token, secretKey);
    return parseApiResponse(data, expectedAction, minScore);
  } catch {
    return { success: false, errorCodes: ["verification-failed"] };
  }
}

/**
 * Verify CAPTCHA with the threshold appropriate for the given action.
 */
export async function verifyCaptchaForAction(
  token: string,
  action: CaptchaAction,
): Promise<CaptchaVerificationResult> {
  const threshold = getThresholdForAction(action);
  return verifyCaptcha(token, action, threshold);
}
