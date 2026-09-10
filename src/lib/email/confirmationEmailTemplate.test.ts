import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/security/sanitize/html";
import {
  buildConfirmationEmailHtml,
  CONFIRMATION_EMAIL_SUBJECT,
} from "./confirmationEmailTemplate";

describe("buildConfirmationEmailHtml", () => {
  const confirmUrl =
    "https://stamp.ai/auth/confirm?token_hash=abc123&type=signup&next=/stamp";

  it("includes the confirmation link in the button and the fallback text", () => {
    const html = buildConfirmationEmailHtml({ confirmUrl });
    const escapedUrl = escapeHtml(confirmUrl);

    expect(html.split(escapedUrl).length - 1).toBeGreaterThanOrEqual(2);
  });

  it("greets the user by first name when provided", () => {
    const html = buildConfirmationEmailHtml({ firstName: "Bruno", confirmUrl });

    expect(html).toContain("Hi Bruno,");
  });

  it("falls back to a generic greeting without a first name", () => {
    const html = buildConfirmationEmailHtml({ confirmUrl });

    expect(html).toContain("Hi,");
  });

  it("escapes HTML in the user-provided first name", () => {
    const html = buildConfirmationEmailHtml({
      firstName: '<img src=x onerror=alert(1)>',
      confirmUrl,
    });

    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("has a non-empty subject", () => {
    expect(CONFIRMATION_EMAIL_SUBJECT.length).toBeGreaterThan(0);
  });
});
