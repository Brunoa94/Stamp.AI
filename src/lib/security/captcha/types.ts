export interface CaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  challengeTimestamp?: string;
  hostname?: string;
  errorCodes?: string[];
}
