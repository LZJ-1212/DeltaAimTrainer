import { beforeEach, describe, expect, it } from "vitest";
import { useTrainingStore } from "./useTrainingStore";

describe("useTrainingStore", () => {
  beforeEach(() => {
    useTrainingStore.getState().reset();
  });

  it("scores a live center hit and leaves the other targets", () => {
    useTrainingStore.getState().fire({ kind: "hit", targetId: "center" });
    const state = useTrainingStore.getState();
    expect(state.score).toBe(1);
    expect(state.shotsHit).toBe(1);
    expect(state.remainingTargetIds).toEqual(["left", "right"]);
    expect(state.lastShot).toBe("hit");
  });
});
