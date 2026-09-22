import { describe, expect, it } from "vitest";
import { consumePointerDelta } from "./pointerDelta";

describe("consumePointerDelta", () => {
  it("drops the first sample after lock so recenter is not applied as look", () => {
    const gate = { ignoreNext: true };
    expect(consumePointerDelta(gate, 12, -4, 2560, 1440)).toBeNull();
    expect(gate.ignoreNext).toBe(false);
    expect(consumePointerDelta(gate, 12, -4, 2560, 1440)).toEqual({
      movementX: 12,
      movementY: -4,
    });
  });

  it("drops viewport-sized spikes from pointer-lock wrap", () => {
    const gate = { ignoreNext: false };
    expect(consumePointerDelta(gate, 2560, 0, 2560, 1440)).toBeNull();
    expect(consumePointerDelta(gate, 0, -1440, 2560, 1440)).toBeNull();
    expect(consumePointerDelta(gate, 40, -18, 2560, 1440)).toEqual({
      movementX: 40,
      movementY: -18,
    });
    expect(consumePointerDelta(gate, 800, 0, 2560, 1440)).toEqual({
      movementX: 800,
      movementY: 0,
    });
    expect(consumePointerDelta(gate, 2500, 0, 2560, 1440)).toBeNull();
  });

  it("rejects non-finite deltas", () => {
    const gate = { ignoreNext: false };
    expect(consumePointerDelta(gate, Number.NaN, 0, 1920, 1080)).toBeNull();
    expect(consumePointerDelta(gate, 0, Number.POSITIVE_INFINITY, 1920, 1080)).toBeNull();
  });
});
