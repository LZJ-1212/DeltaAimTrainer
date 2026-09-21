import type { ShotResult } from "./resolveShot";

export type LastShot = "hit" | "miss" | null;

export type TrainingSnapshot = {
  score: number;
  shotsFired: number;
  shotsHit: number;
  remainingTargetIds: string[];
  lastShot: LastShot;
};

export function createInitialTraining(
  targetIds: readonly string[],
): TrainingSnapshot {
  if (targetIds.length === 0) {
    throw new Error("targetIds must not be empty");
  }
  if (new Set(targetIds).size !== targetIds.length) {
    throw new Error("targetIds must be unique");
  }

  return {
    score: 0,
    shotsFired: 0,
    shotsHit: 0,
    remainingTargetIds: [...targetIds],
    lastShot: null,
  };
}

export function applyShot(
  state: TrainingSnapshot,
  result: ShotResult,
): TrainingSnapshot {
  if (result.kind === "hit" && state.remainingTargetIds.includes(result.targetId)) {
    return {
      score: state.score + 1,
      shotsFired: state.shotsFired + 1,
      shotsHit: state.shotsHit + 1,
      remainingTargetIds: state.remainingTargetIds.filter(
        (id) => id !== result.targetId,
      ),
      lastShot: "hit",
    };
  }

  return {
    score: state.score,
    shotsFired: state.shotsFired + 1,
    shotsHit: state.shotsHit,
    remainingTargetIds: state.remainingTargetIds,
    lastShot: "miss",
  };
}
