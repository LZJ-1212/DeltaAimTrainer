import type { TrackingSample } from "./drillRound";

let trackedMs = 0;
let windowMs = 0;

export function addTrackingSample(deltaMs: number, isOnTarget: boolean): void {
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    throw new Error("deltaMs");
  }
  if (deltaMs === 0) {
    return;
  }
  windowMs += deltaMs;
  if (isOnTarget) {
    trackedMs += deltaMs;
  }
}

export function drainTrackingSample(): TrackingSample {
  const sample = { trackedMs, windowMs };
  trackedMs = 0;
  windowMs = 0;
  return sample;
}
