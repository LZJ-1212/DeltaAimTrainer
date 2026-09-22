import { describe, expect, it } from "vitest";
import {
  WEEK_MS,
  parseNewSession,
  weeklyAccuracyPoints,
  type StoredSession,
} from "./sessionRecord";

const validBody = {
  mode: "flicking",
  optic: "redDot",
  score: 3,
  shotsFired: 4,
  shotsHit: 2,
  avgReactionMs: 420,
  trackingUptime: null,
  dpi: 1600,
  sens: 2,
  hFovDeg: 110,
};

describe("parseNewSession", () => {
  it("computes hit rate from shots and keeps the drill profile", () => {
    expect(parseNewSession(validBody)).toEqual({
      mode: "flicking",
      optic: "redDot",
      score: 3,
      shotsFired: 4,
      shotsHit: 2,
      accuracy: 0.5,
      avgReactionMs: 420,
      trackingUptime: null,
      dpi: 1600,
      sens: 2,
      hFovDeg: 110,
    });
  });

  it("records zero accuracy when the round had no shots", () => {
    expect(
      parseNewSession({ ...validBody, shotsFired: 0, shotsHit: 0, score: 0 }).accuracy,
    ).toBe(0);
  });

  it("rejects hits that exceed shots fired", () => {
    expect(() => parseNewSession({ ...validBody, shotsHit: 5 })).toThrow(/shots/);
  });

  it("rejects a non-integer score and a non-positive sensitivity", () => {
    expect(() => parseNewSession({ ...validBody, score: 1.5 })).toThrow(/score/);
    expect(() => parseNewSession({ ...validBody, sens: 0 })).toThrow(/sens/);
  });

  it("rejects an unknown mode and a hip FOV outside 60–120", () => {
    expect(() => parseNewSession({ ...validBody, mode: "gridshot" })).toThrow(/mode/);
    expect(() => parseNewSession({ ...validBody, hFovDeg: 59 })).toThrow(/fov/);
    expect(() => parseNewSession({ ...validBody, hFovDeg: 121 })).toThrow(/fov/);
  });

  it("rejects tracking uptime outside 0–1", () => {
    expect(() =>
      parseNewSession({ ...validBody, mode: "tracking", trackingUptime: 1.01 }),
    ).toThrow(/trackingUptime/);
  });
});

describe("weeklyAccuracyPoints", () => {
  const now = new Date("2026-09-22T08:00:00.000Z");

  function session(createdAt: string, accuracy: number): StoredSession {
    return {
      id: createdAt,
      createdAt: new Date(createdAt),
      mode: "flicking",
      optic: "redDot",
      score: 1,
      shotsFired: 2,
      shotsHit: 1,
      accuracy,
      avgReactionMs: null,
      trackingUptime: null,
    };
  }

  it("keeps sessions inside the last 7 days, oldest first", () => {
    const edge = new Date(now.getTime() - WEEK_MS).toISOString();
    const older = new Date(now.getTime() - WEEK_MS - 1).toISOString();
    const points = weeklyAccuracyPoints(
      [
        session("2026-09-22T07:00:00.000Z", 0.25),
        session(older, 0.9),
        session(edge, 0.4),
        session("2026-09-23T08:00:00.000Z", 1),
      ],
      now,
    );

    expect(points.map((point) => point.accuracy)).toEqual([0.4, 0.25]);
    expect(points[0]?.createdAt).toBe(edge);
  });
});
