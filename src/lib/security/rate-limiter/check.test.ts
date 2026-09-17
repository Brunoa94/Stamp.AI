import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
    checkCombinedRateLimit,
    checkRateLimit,
    checkUserRateLimit,
} from "./check";
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

describe("checkUserRateLimit", () => {
    const USER = "user-123";
    const USER_ENDPOINT = "/api/generate-image";

    beforeEach(() => {
        clearEntry(`user:${USER_ENDPOINT}:${USER}`);
    });

    it("keys the bucket by user id and allows twice the IP limit", () => {
        for (let i = 0; i < TEST_CONFIG.maxRequests * 2; i++) {
            expect(
                checkUserRateLimit(USER, USER_ENDPOINT, TEST_CONFIG).isLimited,
            ).toBe(false);
        }
        const blocked = checkUserRateLimit(USER, USER_ENDPOINT, TEST_CONFIG);
        expect(blocked.isLimited).toBe(true);
        expect(blocked.headers["Retry-After"]).toBeDefined();
        expect(blocked.headers["X-RateLimit-Limit"]).toBe(
            String(TEST_CONFIG.maxRequests * 2),
        );
    });

    it("does not consume the IP bucket", () => {
        clearEntry(`ip:${USER_ENDPOINT}:unknown`);
        checkUserRateLimit(USER, USER_ENDPOINT, TEST_CONFIG);

        const request = new NextRequest(`https://stamp.ai${USER_ENDPOINT}`);
        const ipResult = checkCombinedRateLimit(request, USER_ENDPOINT, TEST_CONFIG);
        expect(ipResult.remaining).toBe(TEST_CONFIG.maxRequests - 1);
    });
});

describe("checkCombinedRateLimit with a user id", () => {
    const USER = "user-456";
    const USER_ENDPOINT = "/api/combined";

    beforeEach(() => {
        clearEntry(`user:${USER_ENDPOINT}:${USER}`);
        clearEntry(`ip:${USER_ENDPOINT}:unknown`);
    });

    it("limits a user who spreads requests beyond the user bucket", () => {
        const request = new NextRequest(`https://stamp.ai${USER_ENDPOINT}`);
        const userConfig = { maxRequests: 2, windowMs: 60_000 };

        // IP bucket would allow 2, user bucket allows 4. Reset the IP bucket
        // between calls to isolate the user bucket.
        for (let i = 0; i < 4; i++) {
            clearEntry(`ip:${USER_ENDPOINT}:unknown`);
            expect(
                checkCombinedRateLimit(request, USER_ENDPOINT, userConfig, USER)
                    .isLimited,
            ).toBe(false);
        }
        clearEntry(`ip:${USER_ENDPOINT}:unknown`);
        expect(
            checkCombinedRateLimit(request, USER_ENDPOINT, userConfig, USER)
                .isLimited,
        ).toBe(true);
    });
});
