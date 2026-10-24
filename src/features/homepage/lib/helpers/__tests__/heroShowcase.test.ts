import { describe, it, expect } from "vitest";
import { getRotatingWordState } from "../heroShowcase";

describe("getRotatingWordState", () => {
  it("marks the current word active and the one before it leaving", () => {
    expect(getRotatingWordState(2, 2, 5)).toBe("active");
    expect(getRotatingWordState(1, 2, 5)).toBe("leaving");
    expect(getRotatingWordState(3, 2, 5)).toBe("waiting");
  });

  it("treats the last word as leaving when the rotation wraps to the first", () => {
    expect(getRotatingWordState(4, 0, 5)).toBe("leaving");
  });
});
