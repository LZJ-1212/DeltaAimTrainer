import { describe, expect, it } from "vitest";
import { applyShot, createInitialTraining } from "./applyShot";

describe("createInitialTraining", () => {
  it("starts with zero score and all targets remaining", () => {
    expect(createInitialTraining(["left", "center", "right"])).toEqual({
      score: 0,
      shotsFired: 0,
      shotsHit: 0,
      remainingTargetIds: ["left", "center", "right"],
      lastShot: null,
    });
  });

  it("rejects empty or duplicate target ids", () => {
    expect(() => createInitialTraining([])).toThrow(/targetIds/i);
    expect(() => createInitialTraining(["a", "a"])).toThrow(/targetIds/i);
  });
});

describe("applyShot", () => {
  const start = createInitialTraining(["left", "center", "right"]);

  it("does not score a miss", () => {
    expect(applyShot(start, { kind: "miss" })).toEqual({
      ...start,
      shotsFired: 1,
      lastShot: "miss",
    });
  });

  it("scores a live target and removes it", () => {
    expect(applyShot(start, { kind: "hit", targetId: "center" })).toEqual({
      score: 1,
      shotsFired: 1,
      shotsHit: 1,
      remainingTargetIds: ["left", "right"],
      lastShot: "hit",
    });
  });

  it("treats a hit on an already-gone target as a miss", () => {
    const afterHit = applyShot(start, { kind: "hit", targetId: "center" });
    expect(applyShot(afterHit, { kind: "hit", targetId: "center" })).toEqual({
      ...afterHit,
      shotsFired: 2,
      lastShot: "miss",
    });
  });
});
