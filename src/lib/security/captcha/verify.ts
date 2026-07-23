import type { CaptchaVerificationResult } from "./types";
import { type CaptchaAction, getThresholdForAction } from "./constants";
import { verifyWithRecaptchaApi, validateRecaptchaResponse } from "@/services/captchaService";

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
    const data = await verifyWithRecaptchaApi(token, secretKey);
    return validateRecaptchaResponse(data, expectedAction, minScore);
  } catch (error) {
    console.error("[CAPTCHA] Verification error:", error);
    return {
      success: false,
      errorCodes: ["verification-failed"],
    };
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
