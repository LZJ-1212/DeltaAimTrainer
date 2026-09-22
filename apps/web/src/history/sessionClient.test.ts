import { describe, expect, it } from "vitest";
import { parseWeeklyAccuracy, type AccuracyPoint } from "./sessionClient";

describe("parseWeeklyAccuracy", () => {
  it("keeps only complete hit-rate points", () => {
    const points = parseWeeklyAccuracy({
      points: [
        {
          id: "a",
          createdAt: "2026-09-22T08:00:00.000Z",
          mode: "flicking",
          accuracy: 0.5,
        },
        { id: "b", createdAt: "nope", mode: "grid", accuracy: 1 },
        null,
      ],
    });

    expect(points).toEqual<AccuracyPoint[]>([
      {
        id: "a",
        createdAt: "2026-09-22T08:00:00.000Z",
        mode: "flicking",
        accuracy: 0.5,
      },
    ]);
  });

  it("rejects a payload that is not a point list", () => {
    expect(() => parseWeeklyAccuracy({ points: {} })).toThrow(/points/);
    expect(() => parseWeeklyAccuracy(null)).toThrow(/points/);
  });
});
