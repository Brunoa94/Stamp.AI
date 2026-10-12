/**
 * When a request must pass CAPTCHA verification.
 *
 * CAPTCHA only runs when both reCAPTCHA keys are configured. A configured CAPTCHA always fails closed when a token is absent.
 * CAPTCHA_REQUIRED=true also rejects missing server configuration.
 */
export type CaptchaDecisionT = "skip" | "verify" | "reject";

export function captchaDecision(
  token: string | undefined | null,
  env: Record<string, string | undefined> = process.env,
): CaptchaDecisionT {
  const configured = Boolean(env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) && Boolean(env.RECAPTCHA_SECRET_KEY);
  if (!configured) return env.CAPTCHA_REQUIRED === "true" ? "reject" : "skip";
  if (token) return "verify";
  return "reject";
}
