export type ShotCandidate = {
  targetId: string;
  distance: number;
};

export type ShotResult =
  | { kind: "miss" }
  | { kind: "hit"; targetId: string };

export function resolveShot(candidates: readonly ShotCandidate[]): ShotResult {
  let closest: ShotCandidate | null = null;

  for (const candidate of candidates) {
    if (candidate.targetId.length === 0) {
      continue;
    }
    if (!Number.isFinite(candidate.distance) || candidate.distance <= 0) {
      continue;
    }
    if (closest === null || candidate.distance < closest.distance) {
      closest = candidate;
    }
  }

  if (closest === null) {
    return { kind: "miss" };
  }

  return { kind: "hit", targetId: closest.targetId };
}
