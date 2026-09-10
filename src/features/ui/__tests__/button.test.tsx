import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../button";

/**
 * Regression suite for Button class composition.
 *
 * cva emits classes in variants-definition order and tailwind-merge resolves
 * conflicts last-wins. `size` is defined before `variant`, so variants that
 * carry their own dimensions (cta, *-compact, stamp-thumbnail, ...) must win
 * over the default size — the bug this guards against rendered 40px-tall
 * thumbnails and CTAs because `h-10 px-4` clobbered the variant's sizing.
 */

function classesOf(name: string): string {
  return screen.getByRole("button", { name }).className;
}

describe("Button variant/size precedence", () => {
  it("dimensioned variants beat the default size (stamp-thumbnail)", () => {
    render(<Button variant="stamp-thumbnail">Thumb</Button>);
    const classes = classesOf("Thumb");
    expect(classes).toContain("h-20");
    expect(classes).toContain("w-20");
    expect(classes).toContain("p-0");
    expect(classes).not.toMatch(/\bh-10\b/);
    expect(classes).not.toMatch(/\bpx-4\b/);
  });

  it("dimensioned variants beat the default size (cta)", () => {
    render(<Button variant="cta">Go</Button>);
    const classes = classesOf("Go");
    expect(classes).toContain("h-auto");
    expect(classes).toContain("px-16");
    expect(classes).not.toMatch(/\bh-10\b/);
    expect(classes).not.toMatch(/\bpx-4\b/);
  });

  it("variants without dimensions still get the default size", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const classes = classesOf("Ghost");
    expect(classes).toMatch(/\bh-10\b/);
    expect(classes).toMatch(/\bpx-4\b/);
  });

  it("caller className still overrides everything", () => {
    render(
      <Button variant="stamp-thumbnail" className="h-12">
        Custom
      </Button>,
    );
    const classes = classesOf("Custom");
    expect(classes).toContain("h-12");
    expect(classes).not.toMatch(/\bh-20\b/);
  });

  it("selected state styling is driven by aria-pressed", () => {
    render(
      <Button variant="stamp-thumbnail" aria-pressed={true}>
        Selected
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Selected" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
