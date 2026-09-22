import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./createApp";
import { MemorySessionRepository } from "./memorySessionRepository";
import { createSessionService } from "./sessionService";

const now = new Date("2026-09-22T08:00:00.000Z");
const validBody = {
  mode: "flicking",
  optic: "redDot",
  score: 2,
  shotsFired: 2,
  shotsHit: 1,
  avgReactionMs: 300,
  trackingUptime: null,
  dpi: 1600,
  sens: 2,
  hFovDeg: 110,
};

describe("session routes", () => {
  const servers: Array<{ close: (callback: (error?: Error) => void) => void }> = [];

  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
          }),
      ),
    );
  });

  async function listen(): Promise<string> {
    const app = createApp(createSessionService(new MemorySessionRepository(), () => now));
    const server = app.listen(0);
    servers.push(server);
    await new Promise<void>((resolve) => {
      server.once("listening", () => resolve());
    });
    const address = server.address() as AddressInfo;
    return `http://127.0.0.1:${address.port}`;
  }

  it("saves a session and returns it in the weekly hit-rate line", async () => {
    const base = await listen();
    const created = await fetch(`${base}/api/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const week = await fetch(`${base}/api/sessions/week`);

    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ accuracy: 0.5, mode: "flicking" });
    expect(await week.json()).toEqual({
      points: [
        {
          id: expect.any(String),
          createdAt: now.toISOString(),
          mode: "flicking",
          accuracy: 0.5,
        },
      ],
    });
  });

  it("returns 400 and stores nothing when shots are invalid", async () => {
    const base = await listen();
    const created = await fetch(`${base}/api/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validBody, shotsHit: 9 }),
    });

    expect(created.status).toBe(400);
    expect(((await created.json()) as { error: string }).error).toMatch(/shots/);
    expect(await (await fetch(`${base}/api/sessions/week`)).json()).toEqual({ points: [] });
  });
});
