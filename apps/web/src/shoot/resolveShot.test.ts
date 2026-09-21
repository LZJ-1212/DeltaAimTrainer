import { describe, expect, it } from "vitest";
import { resolveShot } from "./resolveShot";

describe("resolveShot", () => {
  it("misses when there are no candidates", () => {
    expect(resolveShot([])).toEqual({ kind: "miss" });
  });

  it("hits the closest valid target", () => {
    expect(
      resolveShot([
        { targetId: "right", distance: 9.4 },
        { targetId: "center", distance: 8.1 },
        { targetId: "left", distance: 8.7 },
      ]),
    ).toEqual({ kind: "hit", targetId: "center" });
  });

  it("ignores empty ids and non-positive distances", () => {
    expect(
      resolveShot([
        { targetId: "", distance: 1 },
        { targetId: "ghost", distance: 0 },
        { targetId: "wall", distance: Number.NaN },
        { targetId: "live", distance: 8.2 },
      ]),
    ).toEqual({ kind: "hit", targetId: "live" });
  });

  it("misses when every candidate is invalid", () => {
    expect(
      resolveShot([
        { targetId: "", distance: 3 },
        { targetId: "gone", distance: -1 },
      ]),
    ).toEqual({ kind: "miss" });
  });
});
