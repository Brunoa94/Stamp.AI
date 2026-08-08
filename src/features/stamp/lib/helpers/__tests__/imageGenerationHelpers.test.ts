import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ImageGenerationTimeoutError,
  dataURLtoFile,
  resolveReferenceImageFile,
  startSimulatedProgress,
} from "../imageGenerationHelpers";

describe("dataURLtoFile", () => {
  it("decodes a base64 data URL into a File with the right mime + name", () => {
    // "hi" base64 = "aGk="
    const file = dataURLtoFile("data:image/png;base64,aGk=", "art.png");
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("art.png");
    expect(file.type).toBe("image/png");
    expect(file.size).toBe(2);
  });

  it("falls back to image/jpeg when the mime is absent", () => {
    const file = dataURLtoFile("data:;base64,aGk=", "x.jpg");
    expect(file.type).toBe("image/jpeg");
  });
});

describe("resolveReferenceImageFile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converts a data URL without hitting the network", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const file = await resolveReferenceImageFile("data:image/png;base64,aGk=");
    expect(file.type).toBe("image/png");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches remote URLs and wraps the blob as a File", async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "image/webp" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ blob: async () => blob }),
    );
    const file = await resolveReferenceImageFile("https://cdn/x.webp");
    expect(file).toBeInstanceOf(File);
    expect(file.type).toBe("image/webp");
    expect(file.size).toBe(3);
  });

  it("returns a placeholder File when nothing is uploaded", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const file = await resolveReferenceImageFile(null);
    expect(file).toBeInstanceOf(File);
    expect(file.name).toContain("placeholder-");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("startSimulatedProgress", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks the progress up by 10 until it caps at 90", () => {
    vi.useFakeTimers();
    let value = 0;
    const setProgress = (update: (prev: number) => number) => {
      value = update(value);
    };
    startSimulatedProgress(setProgress, 100);

    vi.advanceTimersByTime(500); // 5 ticks -> 50
    expect(value).toBe(50);

    vi.advanceTimersByTime(1000); // caps at 90
    expect(value).toBe(90);
  });

  it("stops ticking after the returned stop function is called", () => {
    vi.useFakeTimers();
    let value = 0;
    const setProgress = (update: (prev: number) => number) => {
      value = update(value);
    };
    const stop = startSimulatedProgress(setProgress, 100);

    vi.advanceTimersByTime(200); // 2 ticks -> 20
    stop();
    vi.advanceTimersByTime(1000);
    expect(value).toBe(20);
  });
});

describe("ImageGenerationTimeoutError", () => {
  it("is an Error subclass with the right name", () => {
    const err = new ImageGenerationTimeoutError("too slow");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ImageGenerationTimeoutError");
    expect(err.message).toBe("too slow");
  });
});
