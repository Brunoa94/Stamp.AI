/**
 * When a request must pass CAPTCHA verification.
 *
 * CAPTCHA only runs when both reCAPTCHA keys are configured. With
 * CAPTCHA_REQUIRED=true a configured CAPTCHA also fails closed: a request
 * without a token is rejected instead of skipping verification.
 */
export type CaptchaDecisionT = "skip" | "verify" | "reject";

export function captchaDecision(
  token: string | undefined | null,
  env: Record<string, string | undefined> = process.env,
): CaptchaDecisionT {
  const configured = Boolean(env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) && Boolean(env.RECAPTCHA_SECRET_KEY);
  if (!configured) return "skip";
  if (token) return "verify";
  return env.CAPTCHA_REQUIRED === "true" ? "reject" : "skip";
}
