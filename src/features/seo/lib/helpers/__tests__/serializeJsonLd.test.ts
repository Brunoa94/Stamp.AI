import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "../serializeJsonLd";

describe("serializeJsonLd", () => {
  it("cannot close the surrounding script tag", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("</script>");
    expect(json).not.toContain("<");
  });

  it("round-trips to the same data", () => {
    const data = { name: "Tee & Mug <3>", url: "https://stamp.ai/a?b=1&c=2", note: "line\u2028break" };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
