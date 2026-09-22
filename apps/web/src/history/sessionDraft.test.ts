import { describe, expect, it } from "vitest";
import { applyDrillShot, advanceRound, startRound } from "../shoot/drillRound";
import { toSessionDraft } from "./sessionDraft";

const look = { optic: "redDot" as const, dpi: 1600, sens: 2, hFovDeg: 110 };

describe("toSessionDraft", () => {
  it("returns null before the round is settled", () => {
    expect(toSessionDraft(startRound("flicking"), look)).toBeNull();
  });

  it("maps a settled flick to shots, optic, and rounded TTK", () => {
    let round = advanceRound(startRound("flicking"), 250);
    round = applyDrillShot(round, { kind: "hit", targetId: "flick" });
    round = advanceRound(round, 60_000);

    expect(toSessionDraft(round, { ...look, optic: "scope2x" })).toEqual({
      mode: "flicking",
      optic: "scope2x",
      score: 1,
      shotsFired: 1,
      shotsHit: 1,
      avgReactionMs: 250,
      trackingUptime: null,
      dpi: 1600,
      sens: 2,
      hFovDeg: 110,
    });
  });

  it("maps tracking uptime and leaves reaction time empty", () => {
    const round = advanceRound(startRound("tracking"), 60_000, {
      trackedMs: 300,
      windowMs: 1000,
    });

    expect(toSessionDraft(round, look)).toMatchObject({
      mode: "tracking",
      score: 3,
      shotsFired: 0,
      shotsHit: 0,
      avgReactionMs: null,
      trackingUptime: 0.3,
    });
  });
});
