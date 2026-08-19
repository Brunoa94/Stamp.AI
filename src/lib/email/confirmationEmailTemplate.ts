import { escapeHtml } from "@/lib/security/sanitize/html";

/**
 * Account confirmation email.
 *
 * Inline hex values mirror the stamp brand tokens in globals-stamp.css
 * (chocolate #3d2817, gold #b9932f, cream #faf6f1, off-white #fefefe) —
 * email clients cannot resolve CSS custom properties.
 */

export const CONFIRMATION_EMAIL_SUBJECT = "Confirm your Stamp.AI account";

export interface ConfirmationEmailParamsI {
  firstName?: string;
  confirmUrl: string;
}

export function buildConfirmationEmailHtml(
  { firstName, confirmUrl }: ConfirmationEmailParamsI,
): string {
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const safeUrl = escapeHtml(confirmUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin: 0; padding: 0; background-color: #faf6f1; font-family: Georgia, 'Times New Roman', serif; color: #3d2817;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf6f1; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #fefefe; border: 2px solid rgba(61, 40, 23, 0.12); padding: 40px;">
            <tr>
              <td style="padding-bottom: 24px; font-size: 22px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
                Stamp.AI
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px; font-size: 16px; line-height: 1.6;">
                ${greeting}
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 24px; font-size: 16px; line-height: 1.6;">
                Welcome to Stamp.AI. Confirm your email address to activate your
                account and start turning your ideas into printed clothes.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 24px;">
                <a href="${safeUrl}" style="display: inline-block; background-color: #b9932f; color: #fefefe; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; padding: 14px 32px;">
                  Confirm my account
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 24px; font-size: 13px; line-height: 1.6; color: #c4a08a;">
                Or copy this link into your browser:<br />
                <a href="${safeUrl}" style="color: #b9932f; word-break: break-all;">${safeUrl}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top: 1px solid rgba(61, 40, 23, 0.12); padding-top: 24px; font-size: 12px; line-height: 1.6; color: #c4a08a;">
                This link expires in 1 hour. If you didn't create a Stamp.AI
                account, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
