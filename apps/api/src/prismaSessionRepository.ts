import type { PrismaClient } from "../generated/prisma/client";
import type { SessionRepository } from "./memorySessionRepository";
import type { DrillMode, NewSession, OpticId, StoredSession } from "./sessionRecord";

function requireMode(mode: string): DrillMode {
  if (mode !== "flicking" && mode !== "tracking") {
    throw new Error("mode");
  }
  return mode;
}

function requireOptic(optic: string): OpticId {
  if (optic !== "redDot" && optic !== "scope2x") {
    throw new Error("optic");
  }
  return optic;
}

type SessionRow = {
  id: string;
  createdAt: Date;
  mode: string;
  optic: string;
  score: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  avgReactionMs: number | null;
  trackingUptime: number | null;
};

function toStored(row: SessionRow): StoredSession {
  return {
    id: row.id,
    createdAt: row.createdAt,
    mode: requireMode(row.mode),
    optic: requireOptic(row.optic),
    score: row.score,
    shotsFired: row.shotsFired,
    shotsHit: row.shotsHit,
    accuracy: row.accuracy,
    avgReactionMs: row.avgReactionMs,
    trackingUptime: row.trackingUptime,
  };
}

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(session: NewSession, createdAt: Date): Promise<StoredSession> {
    const row = await this.db.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({ orderBy: { createdAt: "asc" } });
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              dpi: session.dpi,
              sens: session.sens,
              hFovDeg: session.hFovDeg,
            },
          })
        : await tx.user.create({
            data: {
              dpi: session.dpi,
              sens: session.sens,
              hFovDeg: session.hFovDeg,
            },
          });

      return tx.session.create({
        data: {
          createdAt,
          userId: user.id,
          mode: session.mode,
          optic: session.optic,
          score: session.score,
          shotsFired: session.shotsFired,
          shotsHit: session.shotsHit,
          accuracy: session.accuracy,
          avgReactionMs: session.avgReactionMs,
          trackingUptime: session.trackingUptime,
        },
      });
    });

    return toStored(row);
  }

  async listAll(): Promise<StoredSession[]> {
    const rows = await this.db.session.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toStored);
  }
}
