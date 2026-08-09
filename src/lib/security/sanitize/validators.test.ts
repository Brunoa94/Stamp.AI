import { describe, expect, it } from "vitest";
import {
    sanitizeEmail,
    sanitizeFilename,
    sanitizePhone,
    sanitizeUrl,
} from "./validators";

describe("sanitizeUrl", () => {
    it("allows http URLs", () => {
        expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
    });

    it("allows https URLs", () => {
        expect(sanitizeUrl("https://example.com/path?q=1")).toBe(
            "https://example.com/path?q=1",
        );
    });

    it("blocks javascript: protocol", () => {
        expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    });

    it("blocks javascript: with mixed case", () => {
        expect(sanitizeUrl("JaVaScRiPt:alert(1)")).toBeNull();
    });

    it("blocks javascript: with leading whitespace", () => {
        expect(sanitizeUrl("  javascript:alert(1)")).toBeNull();
    });

    it("blocks data: URIs", () => {
        expect(sanitizeUrl("data:text/html,<script>alert(1)</script>"))
            .toBeNull();
    });

    it("blocks vbscript: protocol", () => {
        expect(sanitizeUrl("vbscript:msgbox(1)")).toBeNull();
    });

    it("blocks file: protocol", () => {
        expect(sanitizeUrl("file:///etc/passwd")).toBeNull();
    });

    it("blocks ftp: protocol (not in allowlist)", () => {
        expect(sanitizeUrl("ftp://example.com")).toBeNull();
    });

    it("allows absolute path references", () => {
        expect(sanitizeUrl("/dashboard/orders")).toBe("/dashboard/orders");
    });

    it("blocks protocol-relative URLs (//)", () => {
        expect(sanitizeUrl("//evil.com")).toBeNull();
    });

    it("returns null for empty string", () => {
        expect(sanitizeUrl("")).toBeNull();
    });

    it("returns null for non-string input", () => {
        // @ts-expect-error testing runtime guard
        expect(sanitizeUrl(null)).toBeNull();
    });
});

describe("sanitizeFilename", () => {
    it("removes path traversal sequences", () => {
        const result = sanitizeFilename("../../etc/passwd");
        expect(result).not.toContain("..");
        expect(result).not.toContain("/");
    });

    it("removes forward slashes", () => {
        expect(sanitizeFilename("dir/file.txt")).not.toContain("/");
    });

    it("removes backslashes", () => {
        expect(sanitizeFilename("dir\\file.txt")).not.toContain("\\");
    });

    it("removes null bytes", () => {
        expect(sanitizeFilename("file\0.txt")).not.toContain("\0");
    });

    it("strips leading dots", () => {
        expect(sanitizeFilename(".hidden")).not.toMatch(/^\./);
    });

    it("replaces special chars with underscores", () => {
        const result = sanitizeFilename("my file (1).txt");
        expect(result).toMatch(/^[a-zA-Z0-9._-]+$/);
    });

    it("preserves valid filenames", () => {
        expect(sanitizeFilename("photo_2024-01-01.jpg")).toBe(
            "photo_2024-01-01.jpg",
        );
    });

    it("truncates to 255 chars", () => {
        expect(sanitizeFilename("a".repeat(300))).toHaveLength(255);
    });
});

describe("sanitizeEmail", () => {
    it("returns lowercase normalized email", () => {
        expect(sanitizeEmail("User@Example.COM")).toBe("user@example.com");
    });

    it("returns null for invalid emails", () => {
        expect(sanitizeEmail("notanemail")).toBeNull();
        expect(sanitizeEmail("missing@tld")).toBeNull();
        expect(sanitizeEmail("@nodomain.com")).toBeNull();
    });

    it("returns null for empty string", () => {
        expect(sanitizeEmail("")).toBeNull();
    });

    it("returns null when HTML-embedded email resolves to invalid address", () => {
        // The full input with script prefix is not a valid email format
        expect(sanitizeEmail("not-an-email<script>x</script>")).toBeNull();
    });

    it("returns null for non-string input", () => {
        // @ts-expect-error testing runtime guard
        expect(sanitizeEmail(null)).toBeNull();
    });
});

describe("sanitizePhone", () => {
    it("removes non-numeric characters except leading +", () => {
        expect(sanitizePhone("+1 (555) 123-4567")).toBe("+15551234567");
    });

    it("removes all letters", () => {
        expect(sanitizePhone("1-800-FLOWERS")).toBe("1800");
    });

    it("returns empty string for empty input", () => {
        expect(sanitizePhone("")).toBe("");
    });

    it("truncates to 20 chars", () => {
        expect(sanitizePhone("1".repeat(30))).toHaveLength(20);
    });
});
