import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit } from "./check";
import { clearEntry } from "./store";
import type { RateLimitConfig } from "./types";

const TEST_CONFIG: RateLimitConfig = {
    maxRequests: 3,
    windowMs: 60_000,
};

const ID = "test-ip";
const ENDPOINT = "test-endpoint";

beforeEach(() => {
    clearEntry(`${ENDPOINT}:${ID}`);
    clearEntry(`ip:${ENDPOINT}:${ID}`);
});

describe("checkRateLimit", () => {
    it("allows requests up to the limit", () => {
        for (let i = 0; i < TEST_CONFIG.maxRequests; i++) {
            const result = checkRateLimit(ID, ENDPOINT, TEST_CONFIG);
            expect(result.isLimited).toBe(false);
        }
    });

    it("blocks requests that exceed the limit", () => {
        for (let i = 0; i < TEST_CONFIG.maxRequests; i++) {
            checkRateLimit(ID, ENDPOINT, TEST_CONFIG);
        }
        const result = checkRateLimit(ID, ENDPOINT, TEST_CONFIG);
        expect(result.isLimited).toBe(true);
        expect(result.remaining).toBe(0);
        expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("decrements remaining correctly", () => {
        const first = checkRateLimit(ID, ENDPOINT, TEST_CONFIG);
        expect(first.remaining).toBe(TEST_CONFIG.maxRequests - 1);

        const second = checkRateLimit(ID, ENDPOINT, TEST_CONFIG);
        expect(second.remaining).toBe(TEST_CONFIG.maxRequests - 2);
    });

    it("resets the window after expiry", () => {
        const expiredConfig: RateLimitConfig = { maxRequests: 1, windowMs: 1 };
        const key = `expired-endpoint:${ID}`;
        clearEntry(key);

        checkRateLimit(ID, "expired-endpoint", expiredConfig);

        // Wait for window to expire
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const result = checkRateLimit(
                    ID,
                    "expired-endpoint",
                    expiredConfig,
                );
                expect(result.isLimited).toBe(false);
                resolve();
            }, 10);
        });
    });

    it("uses separate buckets for different endpoints", () => {
        const endpointA = "endpoint-a";
        const endpointB = "endpoint-b";
        clearEntry(`${endpointA}:${ID}`);
        clearEntry(`${endpointB}:${ID}`);

        for (let i = 0; i < TEST_CONFIG.maxRequests; i++) {
            checkRateLimit(ID, endpointA, TEST_CONFIG);
        }
        const blocked = checkRateLimit(ID, endpointA, TEST_CONFIG);
        expect(blocked.isLimited).toBe(true);

        const other = checkRateLimit(ID, endpointB, TEST_CONFIG);
        expect(other.isLimited).toBe(false);
    });

    it("uses separate buckets for different identifiers", () => {
        clearEntry(`${ENDPOINT}:ip-a`);
        clearEntry(`${ENDPOINT}:ip-b`);

        for (let i = 0; i < TEST_CONFIG.maxRequests; i++) {
            checkRateLimit("ip-a", ENDPOINT, TEST_CONFIG);
        }
        expect(checkRateLimit("ip-a", ENDPOINT, TEST_CONFIG).isLimited).toBe(
            true,
        );
        expect(checkRateLimit("ip-b", ENDPOINT, TEST_CONFIG).isLimited).toBe(
            false,
        );
    });
});
