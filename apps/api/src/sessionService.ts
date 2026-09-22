import {
  parseNewSession,
  weeklyAccuracyPoints,
  type AccuracyPoint,
  type StoredSession,
} from "./sessionRecord";
import type { SessionRepository } from "./memorySessionRepository";

export function createSessionService(
  repository: SessionRepository,
  now: () => Date = () => new Date(),
) {
  return {
    async record(input: unknown): Promise<StoredSession> {
      return repository.save(parseNewSession(input), now());
    },
    async week(): Promise<AccuracyPoint[]> {
      return weeklyAccuracyPoints(await repository.listAll(), now());
    },
  };
}
