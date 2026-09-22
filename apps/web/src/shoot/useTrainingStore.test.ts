import { beforeEach, describe, expect, it } from "vitest";
import { createIdleRound } from "./drillRound";
import { useTrainingStore } from "./useTrainingStore";

describe("useTrainingStore", () => {
  beforeEach(() => {
    useTrainingStore.setState(createIdleRound("flicking"));
  });

  it("does not score before the round starts", () => {
    useTrainingStore.getState().fire({ kind: "hit", targetId: "flick" });
    expect(useTrainingStore.getState().score).toBe(0);
  });

  it("scores a flick kill and arms the next spawn", () => {
    useTrainingStore.getState().start("flicking");
    useTrainingStore.getState().tick(200);
    useTrainingStore.getState().fire({ kind: "hit", targetId: "flick" });
    const state = useTrainingStore.getState();
    expect(state.score).toBe(1);
    expect(state.shotsHit).toBe(1);
    expect(state.spawnIndex).toBe(1);
    expect(state.lastShot).toBe("hit");
    expect(state.ttkSumMs).toBe(200);
  });

  it("clears only the hit flash", () => {
    useTrainingStore.getState().start("flicking");
    useTrainingStore.getState().fire({ kind: "hit", targetId: "flick" });
    useTrainingStore.getState().clearLastShot();
    const state = useTrainingStore.getState();
    expect(state.lastShot).toBeNull();
    expect(state.score).toBe(1);
  });

  it("bumps the round serial so a restarted track clock starts over", () => {
    const before = useTrainingStore.getState().roundSerial;
    useTrainingStore.getState().start("tracking");
    expect(useTrainingStore.getState().roundSerial).toBe(before + 1);
  });

  it("settles a tracking round at 60 seconds", () => {
    useTrainingStore.getState().start("tracking");
    useTrainingStore.getState().tick(60_000, { trackedMs: 15_000, windowMs: 60_000 });
    const state = useTrainingStore.getState();
    expect(state.phase).toBe("settled");
    expect(state.mode).toBe("tracking");
    expect(state.trackedMs).toBe(15_000);
    expect(state.trackingWindowMs).toBe(60_000);
    expect(state.score).toBe(150);
  });
});
