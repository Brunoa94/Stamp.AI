import { describe, it, expect } from "vitest";
import { stripHtml, resolveProductDescription } from "../productDescription";

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Soft cotton tee</p>")).toBe("Soft cotton tee");
  });

  it("replaces tags with spaces so words don't merge", () => {
    expect(stripHtml("<p>Line one</p><p>Line two</p>")).toBe("Line one Line two");
  });

  it("handles nested tags and attributes", () => {
    expect(
      stripHtml('<div class="desc"><strong>Premium</strong> <em>quality</em> print</div>')
    ).toBe("Premium quality print");
  });

  it("decodes common HTML entities", () => {
    expect(stripHtml("Fit &amp; finish &lt;guaranteed&gt;")).toBe(
      "Fit & finish <guaranteed>"
    );
    expect(stripHtml("It&#39;s &quot;soft&quot;&nbsp;cotton")).toBe(
      'It\'s "soft" cotton'
    );
  });

  it("collapses consecutive whitespace and trims", () => {
    expect(stripHtml("  Soft \n\n cotton\t tee  ")).toBe("Soft cotton tee");
  });

  it("returns empty string for markup-only input", () => {
    expect(stripHtml("<p><br/></p>")).toBe("");
  });

  it("leaves plain text untouched", () => {
    expect(stripHtml("Plain description")).toBe("Plain description");
  });
});

describe("resolveProductDescription", () => {
  it("returns null when seo is null or undefined", () => {
    expect(resolveProductDescription(null)).toBeNull();
    expect(resolveProductDescription(undefined)).toBeNull();
  });

  it("prefers meta_description over printify_description", () => {
    expect(
      resolveProductDescription({
        meta_description: "Curated meta copy",
        printify_description: "<p>Printify copy</p>",
      })
    ).toBe("Curated meta copy");
  });

  it("falls back to stripped printify_description when meta_description is empty", () => {
    expect(
      resolveProductDescription({
        meta_description: "   ",
        printify_description: "<p>Printify copy</p>",
      })
    ).toBe("Printify copy");
  });

  it("falls back to stripped printify_description when meta_description is null", () => {
    expect(
      resolveProductDescription({
        meta_description: null,
        printify_description: "<div>Heavyweight <b>tote</b> bag</div>",
      })
    ).toBe("Heavyweight tote bag");
  });

  it("returns null when printify_description strips to nothing", () => {
    expect(
      resolveProductDescription({
        meta_description: null,
        printify_description: "<p> </p>",
      })
    ).toBeNull();
  });

  it("returns null when both fields are null", () => {
    expect(
      resolveProductDescription({
        meta_description: null,
        printify_description: null,
      })
    ).toBeNull();
  });
});
