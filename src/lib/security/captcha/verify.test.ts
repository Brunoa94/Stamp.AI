import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyCaptcha } from "./verify";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe("verifyCaptcha", () => {
    it("returns missing-secret-key when RECAPTCHA_SECRET_KEY is not set", async () => {
        vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
        const result = await verifyCaptcha("some-token");
        expect(result.success).toBe(false);
        expect(result.errorCodes).toContain("missing-secret-key");
    });

    it("returns missing-input-response for empty token", async () => {
        vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
        const result = await verifyCaptcha("");
        expect(result.success).toBe(false);
        expect(result.errorCodes).toContain("missing-input-response");
    });

    it("returns verification-failed when fetch throws", async () => {
        vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
        vi.spyOn(global, "fetch").mockRejectedValueOnce(
            new Error("network error"),
        );
        const result = await verifyCaptcha("token");
        expect(result.success).toBe(false);
        expect(result.errorCodes).toContain("verification-failed");
    });

    it("returns score-too-low when score is below threshold", async () => {
        vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            json: async () => ({ success: true, score: 0.2, action: "login" }),
        } as Response);
        const result = await verifyCaptcha("token", "login", 0.5);
        expect(result.success).toBe(false);
        expect(result.errorCodes).toContain("score-too-low");
        expect(result.score).toBe(0.2);
    });

    it("returns action-mismatch when action does not match", async () => {
        vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            json: async () => ({
                success: true,
                score: 0.9,
                action: "register",
            }),
        } as Response);
        const result = await verifyCaptcha("token", "login", 0.5);
        expect(result.success).toBe(false);
        expect(result.errorCodes).toContain("action-mismatch");
    });

    it("succeeds when score and action match", async () => {
        vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            json: async () => ({
                success: true,
                score: 0.9,
                action: "login",
                challenge_ts: "2024-01-01T00:00:00Z",
                hostname: "example.com",
            }),
        } as Response);
        const result = await verifyCaptcha("token", "login", 0.5);
        expect(result.success).toBe(true);
        expect(result.score).toBe(0.9);
        expect(result.hostname).toBe("example.com");
    });

    it("returns unknown-error when API returns success:false with no error codes", async () => {
        vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            json: async () => ({ success: false }),
        } as Response);
        const result = await verifyCaptcha("token");
        expect(result.success).toBe(false);
        expect(result.errorCodes).toContain("unknown-error");
    });
});
