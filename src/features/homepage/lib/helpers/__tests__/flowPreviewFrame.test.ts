import { describe, it, expect } from "vitest";
import {
  getFlowFrame,
  getNextPosition,
  getRailStatus,
  getStepDurationTicks,
} from "../flowPreviewFrame";
import { FLOW_CUES, FLOW_STEPS } from "../../constants/flowPreview";

const PROMPT_LENGTH = 40;
const stepIndexOf = (id: string) => FLOW_STEPS.findIndex((step) => step.id === id);

describe("getStepDurationTicks", () => {
  it("adds the prompt length to the describe step only", () => {
    expect(getStepDurationTicks(stepIndexOf("describe"), PROMPT_LENGTH)).toBe(30 + PROMPT_LENGTH);
    expect(getStepDurationTicks(stepIndexOf("upload"), PROMPT_LENGTH)).toBe(70);
  });
});

describe("getNextPosition", () => {
  it("advances the tick within a step", () => {
    expect(getNextPosition({ stepIndex: 0, tick: 5 }, PROMPT_LENGTH)).toEqual({ stepIndex: 0, tick: 6 });
  });

  it("moves to the next step once the current one ends", () => {
    expect(getNextPosition({ stepIndex: 0, tick: 70 }, PROMPT_LENGTH)).toEqual({ stepIndex: 1, tick: 0 });
  });

  it("loops from the final step back to upload", () => {
    const last = FLOW_STEPS.length - 1;
    expect(getNextPosition({ stepIndex: last, tick: 90 }, PROMPT_LENGTH)).toEqual({ stepIndex: 0, tick: 0 });
  });
});

describe("getFlowFrame", () => {
  it("shows the upload and its toast after the upload cue", () => {
    const before = getFlowFrame(stepIndexOf("upload"), FLOW_CUES.uploadAt, PROMPT_LENGTH);
    const after = getFlowFrame(stepIndexOf("upload"), FLOW_CUES.uploadToastFrom + 1, PROMPT_LENGTH);

    expect(before.isUploaded).toBe(false);
    expect(before.toast).toBeNull();
    expect(after.isUploaded).toBe(true);
    expect(after.toast).toBe("uploaded");
  });

  it("types the prompt one character per tick and caps at its length", () => {
    const describe = stepIndexOf("describe");

    expect(getFlowFrame(describe, 12, PROMPT_LENGTH).typedCount).toBe(12);
    expect(getFlowFrame(describe, 12, PROMPT_LENGTH).isPromptComplete).toBe(false);
    expect(getFlowFrame(describe, 60, PROMPT_LENGTH).typedCount).toBe(PROMPT_LENGTH);
    expect(getFlowFrame(describe, 60, PROMPT_LENGTH).isPromptComplete).toBe(true);
  });

  it("caps generation progress at 100%", () => {
    expect(getFlowFrame(stepIndexOf("process"), 25, PROMPT_LENGTH).progressPct).toBe(50);
    expect(getFlowFrame(stepIndexOf("process"), 56, PROMPT_LENGTH).progressPct).toBe(100);
  });

  it("enlarges the print, then shrinks it back and rotates it", () => {
    const customize = stepIndexOf("customize");

    expect(getFlowFrame(customize, 30, PROMPT_LENGTH).printSize.pct).toBe(120);
    expect(getFlowFrame(customize, 55, PROMPT_LENGTH).printSize.pct).toBe(100);
    expect(getFlowFrame(customize, 55, PROMPT_LENGTH).rotationIndex).toBe(0);
    expect(getFlowFrame(customize, 70, PROMPT_LENGTH).rotationIndex).toBe(1);
  });

  it("bags the product and shows the cart toast on the final step", () => {
    const frame = getFlowFrame(stepIndexOf("final"), FLOW_CUES.bagAt + 1, PROMPT_LENGTH);

    expect(frame.isBagged).toBe(true);
    expect(frame.toast).toBe("bagged");
  });

  it("keeps step-specific cues off in other steps", () => {
    const frame = getFlowFrame(stepIndexOf("results"), 80, PROMPT_LENGTH);

    expect(frame.isUploaded).toBe(false);
    expect(frame.isTeeSelected).toBe(false);
    expect(frame.isBagged).toBe(false);
    expect(frame.toast).toBeNull();
  });
});

describe("getRailStatus", () => {
  it("marks earlier steps done, the playing step active and the rest upcoming", () => {
    const results = stepIndexOf("results");

    expect(getRailStatus(0, results)).toBe("done");
    expect(getRailStatus(results - 1, results)).toBe("done");
    expect(getRailStatus(results, results)).toBe("active");
    expect(getRailStatus(results + 1, results)).toBe("upcoming");
  });
});
