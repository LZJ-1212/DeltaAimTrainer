import type { NewSession, StoredSession } from "./sessionRecord";

export type SessionRepository = {
  save(session: NewSession, createdAt: Date): Promise<StoredSession>;
  listAll(): Promise<StoredSession[]>;
};

export class MemorySessionRepository implements SessionRepository {
  private readonly sessions: StoredSession[] = [];
  private nextId = 1;

  async save(session: NewSession, createdAt: Date): Promise<StoredSession> {
    const stored: StoredSession = {
      id: String(this.nextId),
      createdAt,
      mode: session.mode,
      optic: session.optic,
      score: session.score,
      shotsFired: session.shotsFired,
      shotsHit: session.shotsHit,
      accuracy: session.accuracy,
      avgReactionMs: session.avgReactionMs,
      trackingUptime: session.trackingUptime,
    };
    this.nextId += 1;
    this.sessions.push(stored);
    return stored;
  }

  async listAll(): Promise<StoredSession[]> {
    return this.sessions.map((session) => ({
      ...session,
      createdAt: new Date(session.createdAt),
    }));
  }
}
