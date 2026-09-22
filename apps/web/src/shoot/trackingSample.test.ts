import { beforeEach, describe, expect, it } from "vitest";
import { addTrackingSample, drainTrackingSample } from "./trackingSample";

describe("trackingSample", () => {
  beforeEach(() => {
    drainTrackingSample();
  });

  it("counts on-target time inside the window and resets on drain", () => {
    addTrackingSample(40, true);
    addTrackingSample(60, false);
    expect(drainTrackingSample()).toEqual({ trackedMs: 40, windowMs: 100 });
    expect(drainTrackingSample()).toEqual({ trackedMs: 0, windowMs: 0 });
  });

  it("ignores a zero delta and rejects a negative one", () => {
    addTrackingSample(0, true);
    expect(drainTrackingSample()).toEqual({ trackedMs: 0, windowMs: 0 });
    expect(() => addTrackingSample(-5, true)).toThrow(/deltaMs/i);
  });
});
