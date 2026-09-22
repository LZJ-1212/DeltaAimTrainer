import express, { type Express } from "express";
import type { createSessionService } from "./sessionService";

type SessionService = ReturnType<typeof createSessionService>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "invalid";
}

export function createApp(service: SessionService): Express {
  const app = express();
  app.use(express.json());

  app.post("/api/sessions", async (req, res) => {
    try {
      const saved = await service.record(req.body);
      res.status(201).json({
        ...saved,
        createdAt: saved.createdAt.toISOString(),
      });
    } catch (error) {
      res.status(400).json({ error: errorMessage(error) });
    }
  });

  app.get("/api/sessions/week", async (_req, res) => {
    try {
      res.json({ points: await service.week() });
    } catch (error) {
      res.status(500).json({ error: errorMessage(error) });
    }
  });

  return app;
}
