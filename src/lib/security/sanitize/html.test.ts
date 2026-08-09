import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeForDisplay, stripHtml, truncate } from "./html";

describe("escapeHtml", () => {
    it("escapes all dangerous HTML characters", () => {
        const result = escapeHtml('<script>alert("xss")</script>');
        expect(result).not.toContain("<");
        expect(result).not.toContain(">");
        expect(result).not.toContain('"');
        expect(result).toContain("&lt;");
        expect(result).toContain("&gt;");
        expect(result).toContain("&quot;");

        const imgResult = escapeHtml("<img src=x onerror=alert(1)>");
        expect(imgResult).not.toContain("<");
        expect(imgResult).not.toContain(">");
        expect(imgResult).not.toContain('"');
    });

    it("escapes ampersands", () => {
        expect(escapeHtml("a & b")).toBe("a &amp; b");
    });

    it("escapes single quotes", () => {
        expect(escapeHtml("it's")).toBe("it&#x27;s");
    });

    it("escapes backticks", () => {
        expect(escapeHtml("`template`")).toBe("&#x60;template&#x60;");
    });

    it("escapes equals signs", () => {
        expect(escapeHtml("a=b")).toBe("a&#x3D;b");
    });

    it("passes through plain text unchanged except for special chars", () => {
        expect(escapeHtml("Hello, World!")).toBe("Hello, World!");
    });
});

describe("stripHtml", () => {
    it("removes script tags and their content", () => {
        const result = stripHtml('<script>alert("xss")</script>hello');
        expect(result).toBe("hello");
        expect(result).not.toContain("script");
        expect(result).not.toContain("alert");
    });

    it("removes style tags and their content", () => {
        const result = stripHtml("<style>body{color:red}</style>hello");
        expect(result).toBe("hello");
        expect(result).not.toContain("style");
    });

    it("removes arbitrary HTML tags but keeps text", () => {
        expect(stripHtml("<b>bold</b> and <i>italic</i>")).toBe(
            "bold and italic",
        );
    });

    it("handles self-closing tags", () => {
        expect(stripHtml("hello<br/>world")).toBe("helloworld");
    });

    it("returns plain text unchanged", () => {
        expect(stripHtml("no html here")).toBe("no html here");
    });
});

describe("sanitizeForDisplay", () => {
    it("strips tags then escapes remaining entities", () => {
        const result = sanitizeForDisplay('<b>Hello & "World"</b>');
        expect(result).not.toContain("<");
        expect(result).not.toContain(">");
        expect(result).toContain("Hello");
        expect(result).toContain("&amp;");
        expect(result).toContain("&quot;");
    });
});

describe("truncate", () => {
    it("returns strings shorter than maxLength unchanged", () => {
        expect(truncate("hello", 10)).toBe("hello");
    });

    it("truncates at maxLength with ellipsis", () => {
        const result = truncate("hello world", 8);
        expect(result).toBe("hello...");
        expect(result.length).toBe(8);
    });

    it("returns string unchanged when equal to maxLength", () => {
        expect(truncate("hello", 5)).toBe("hello");
    });
});
