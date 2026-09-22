import { describe, expect, it } from "vitest";
import {
  advanceRound,
  applyDrillShot,
  averageTtkMs,
  createIdleRound,
  displaySeconds,
  firstShotRate,
  hitRate,
  remainingMs,
  isTrackingCredit,
  startRound,
  trackingUptime,
} from "./drillRound";

describe("startRound", () => {
  it("opens a 60 second flicking round with empty stats", () => {
    expect(startRound("flicking")).toEqual({
      ...createIdleRound("flicking"),
      phase: "running",
    });
    expect(remainingMs(startRound("flicking"))).toBe(60_000);
  });

  it("opens a tracking round without carrying the previous score", () => {
    const held = advanceRound(startRound("tracking"), 500, {
      trackedMs: 500,
      windowMs: 500,
    });
    expect(held.score).toBe(5);
    expect(startRound("tracking").score).toBe(0);
  });

  it("rejects an unknown mode", () => {
    expect(() => startRound("hipfire" as "flicking")).toThrow(/mode/i);
  });
});

describe("advanceRound", () => {
  it("counts time only while the round is running and settles at 60 seconds", () => {
    const idle = advanceRound(createIdleRound("flicking"), 5_000);
    expect(idle.phase).toBe("idle");
    expect(idle.elapsedMs).toBe(0);

    const running = advanceRound(startRound("flicking"), 1_000);
    expect(running.elapsedMs).toBe(1_000);
    expect(running.phase).toBe("running");
    expect(remainingMs(running)).toBe(59_000);

    const settled = advanceRound(running, 59_500);
    expect(settled.elapsedMs).toBe(60_000);
    expect(settled.phase).toBe("settled");
    expect(remainingMs(settled)).toBe(0);
    expect(displaySeconds(createIdleRound("flicking"))).toBe(60);
    expect(displaySeconds(running)).toBe(59);
    expect(displaySeconds(settled)).toBe(0);
    expect(advanceRound(settled, 2_000).elapsedMs).toBe(60_000);
  });

  it("rejects a negative or non-finite delta", () => {
    const running = startRound("flicking");
    expect(() => advanceRound(running, -1)).toThrow(/deltaMs/i);
    expect(() => advanceRound(running, Number.NaN)).toThrow(/deltaMs/i);
  });

  it("adds on-target time and drops the part that falls after the buzzer", () => {
    const nearEnd = advanceRound(startRound("tracking"), 59_500);
    const settled = advanceRound(nearEnd, 1_000, {
      trackedMs: 800,
      windowMs: 1_000,
    });
    expect(settled.phase).toBe("settled");
    expect(settled.trackedMs).toBe(400);
    expect(settled.trackingWindowMs).toBe(500);
    expect(settled.score).toBe(4);
    expect(trackingUptime(settled)).toBeCloseTo(0.8);
  });

  it("does not stretch a short sample to the whole tick", () => {
    const next = advanceRound(startRound("tracking"), 1_000, {
      trackedMs: 40,
      windowMs: 100,
    });
    expect(next.trackedMs).toBe(40);
    expect(next.trackingWindowMs).toBe(100);
  });

  it("clamps on-target time to the sample window", () => {
    const next = advanceRound(startRound("tracking"), 1_000, {
      trackedMs: 1_500,
      windowMs: 1_000,
    });
    expect(next.trackedMs).toBe(1_000);
    expect(next.trackingWindowMs).toBe(1_000);
  });

  it("ignores tracking samples once the round is idle or settled", () => {
    const sample = { trackedMs: 100, windowMs: 100 };
    expect(advanceRound(createIdleRound("tracking"), 200, sample).trackedMs).toBe(0);
    const settled = advanceRound(startRound("tracking"), 60_000);
    expect(advanceRound(settled, 200, sample).trackedMs).toBe(0);
  });
});

describe("applyDrillShot", () => {
  it("records a flick miss then a kill, and respawns for the next first shot", () => {
    let round = advanceRound(startRound("flicking"), 400);
    round = applyDrillShot(round, { kind: "miss" });
    round = advanceRound(round, 250);
    round = applyDrillShot(round, { kind: "hit", targetId: "flick" });

    expect(round.shotsFired).toBe(2);
    expect(round.shotsHit).toBe(1);
    expect(round.score).toBe(1);
    expect(round.kills).toBe(1);
    expect(round.firstShotAttempts).toBe(1);
    expect(round.firstShotHits).toBe(0);
    expect(round.ttkSumMs).toBe(650);
    expect(round.ttkSamples).toBe(1);
    expect(round.spawnIndex).toBe(1);
    expect(round.spawnedAtMs).toBe(650);
    expect(round.shotsOnTarget).toBe(0);
    expect(round.lastShot).toBe("hit");
    expect(averageTtkMs(round)).toBe(650);
    expect(firstShotRate(round)).toBe(0);
    expect(hitRate(round)).toBe(0.5);

    round = applyDrillShot(round, { kind: "miss" });
    expect(round.firstShotAttempts).toBe(2);
    expect(round.firstShotHits).toBe(0);
    expect(round.shotsOnTarget).toBe(1);
    expect(round.kills).toBe(1);
  });

  it("counts a one-shot flick kill as a first-shot hit", () => {
    const round = applyDrillShot(advanceRound(startRound("flicking"), 180), {
      kind: "hit",
      targetId: "flick",
    });
    expect(round.firstShotAttempts).toBe(1);
    expect(round.firstShotHits).toBe(1);
    expect(round.ttkSumMs).toBe(180);
    expect(round.spawnIndex).toBe(1);
    expect(firstShotRate(round)).toBe(1);
  });

  it("treats a flick hit on the wrong id as a miss", () => {
    const round = applyDrillShot(startRound("flicking"), {
      kind: "hit",
      targetId: "track",
    });
    expect(round.shotsHit).toBe(0);
    expect(round.kills).toBe(0);
    expect(round.firstShotAttempts).toBe(1);
    expect(round.lastShot).toBe("miss");
  });

  it("does not open a new first-shot attempt for follow-up flick misses", () => {
    let round = applyDrillShot(startRound("flicking"), { kind: "miss" });
    round = applyDrillShot(round, { kind: "miss" });
    expect(round.firstShotAttempts).toBe(1);
    expect(round.shotsFired).toBe(2);
    expect(round.shotsOnTarget).toBe(2);
  });

  it("records a tracking click without adding score or a kill", () => {
    const round = applyDrillShot(startRound("tracking"), {
      kind: "hit",
      targetId: "track",
    });
    expect(round.score).toBe(0);
    expect(round.shotsHit).toBe(1);
    expect(round.kills).toBe(0);
    expect(round.spawnIndex).toBe(0);
    expect(round.firstShotAttempts).toBe(0);
    expect(round.lastShot).toBe("hit");
  });

  it("raises tracking score from held on-target time, not from an empty sample", () => {
    const released = advanceRound(startRound("tracking"), 1_000, {
      trackedMs: 0,
      windowMs: 1_000,
    });
    expect(released.score).toBe(0);
    expect(released.trackingWindowMs).toBe(1_000);

    const held = advanceRound(startRound("tracking"), 1_000, {
      trackedMs: 250,
      windowMs: 1_000,
    });
    expect(held.score).toBe(2);
    expect(held.trackedMs).toBe(250);
  });

  it("ignores shots before the round starts and after it settles", () => {
    const idle = applyDrillShot(createIdleRound("flicking"), {
      kind: "hit",
      targetId: "flick",
    });
    expect(idle.shotsFired).toBe(0);
    expect(idle.lastShot).toBeNull();

    const settled = applyDrillShot(advanceRound(startRound("flicking"), 60_000), {
      kind: "hit",
      targetId: "flick",
    });
    expect(settled.shotsFired).toBe(0);
    expect(settled.phase).toBe("settled");
  });
});

describe("isTrackingCredit", () => {
  it("counts only while fire is held on the target", () => {
    expect(isTrackingCredit(true, true)).toBe(true);
    expect(isTrackingCredit(true, false)).toBe(false);
    expect(isTrackingCredit(false, true)).toBe(false);
    expect(isTrackingCredit(false, false)).toBe(false);
  });
});

describe("round rates", () => {
  it("returns null until there is a sample", () => {
    const round = startRound("flicking");
    expect(averageTtkMs(round)).toBeNull();
    expect(firstShotRate(round)).toBeNull();
    expect(hitRate(round)).toBeNull();
    expect(trackingUptime(round)).toBeNull();
  });
});
