import { describe, expect, it } from "vitest";
import { createSessionService } from "./sessionService";
import { MemorySessionRepository } from "./memorySessionRepository";

const now = new Date("2026-09-22T08:00:00.000Z");

const validBody = {
  mode: "tracking",
  optic: "scope2x",
  score: 12,
  shotsFired: 3,
  shotsHit: 1,
  avgReactionMs: null,
  trackingUptime: 0.2,
  dpi: 1600,
  sens: 2,
  hFovDeg: 110,
};

describe("createSessionService", () => {
  it("stores a settled round and lists it in the last week", async () => {
    const service = createSessionService(new MemorySessionRepository(), () => now);

    const saved = await service.record(validBody);
    const week = await service.week();

    expect(saved.accuracy).toBeCloseTo(1 / 3);
    expect(saved.optic).toBe("scope2x");
    expect(week).toEqual([
      {
        id: saved.id,
        createdAt: now.toISOString(),
        mode: "tracking",
        accuracy: saved.accuracy,
      },
    ]);
  });

  it("omits a session older than seven days", async () => {
    let current = new Date("2026-09-14T07:59:59.999Z");
    const service = createSessionService(new MemorySessionRepository(), () => current);
    await service.record(validBody);
    current = now;

    expect(await service.week()).toEqual([]);
  });

  it("rejects an invalid body without storing it", async () => {
    const service = createSessionService(new MemorySessionRepository(), () => now);

    await expect(service.record({ ...validBody, shotsFired: -1 })).rejects.toThrow(/shots/);
    expect(await service.week()).toEqual([]);
  });
});
