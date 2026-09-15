// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isDuplicateWebhookEvent } from "../../../supabase/functions/_shared/webhookEventClaim";

/**
 * Webhooks record every event atomically before processing it; a row that
 * predates the current delivery means the provider retried an event we
 * already handled.
 */

const now = Date.parse("2026-09-15T10:00:00.000Z");

describe("isDuplicateWebhookEvent", () => {
  it("treats a row recorded long before now as a duplicate delivery", () => {
    expect(isDuplicateWebhookEvent({ created_at: "2026-09-15T09:59:00.000Z" }, now)).toBe(true);
  });

  it("treats a row recorded within the grace window as this delivery's own insert", () => {
    expect(isDuplicateWebhookEvent({ created_at: "2026-09-15T09:59:57.000Z" }, now)).toBe(false);
    expect(isDuplicateWebhookEvent({ created_at: "2026-09-15T10:00:01.000Z" }, now)).toBe(false);
  });

  it("never skips processing when the record is missing or malformed", () => {
    expect(isDuplicateWebhookEvent(null, now)).toBe(false);
    expect(isDuplicateWebhookEvent({}, now)).toBe(false);
    expect(isDuplicateWebhookEvent({ created_at: "not a date" }, now)).toBe(false);
  });

  it("honours a custom grace window", () => {
    expect(isDuplicateWebhookEvent({ created_at: "2026-09-15T09:59:50.000Z" }, now, 30)).toBe(false);
    expect(isDuplicateWebhookEvent({ created_at: "2026-09-15T09:59:50.000Z" }, now, 5)).toBe(true);
  });
});
