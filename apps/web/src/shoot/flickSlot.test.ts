import { describe, expect, it } from "vitest";
import { flickSlot } from "./flickSlot";

describe("flickSlot", () => {
  it("places the first two spawns on different lanes and wraps", () => {
    expect(flickSlot(0)).toEqual({ x: -2.6, z: -8 });
    expect(flickSlot(1)).toEqual({ x: 2.2, z: -7.2 });
    expect(flickSlot(5)).toEqual(flickSlot(0));
  });

  it("rejects a negative or fractional spawn index", () => {
    expect(() => flickSlot(-1)).toThrow(/spawnIndex/i);
    expect(() => flickSlot(1.5)).toThrow(/spawnIndex/i);
  });
});
