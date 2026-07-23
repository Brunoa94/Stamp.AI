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
    case "checkout":
      return CAPTCHA_THRESHOLDS.HIGH;
    case "image_generation":
    case "contact":
      return CAPTCHA_THRESHOLDS.MEDIUM;
    default:
      return CAPTCHA_THRESHOLDS.MEDIUM;
  }
}
