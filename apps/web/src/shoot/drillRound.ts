import type { ShotResult } from "./resolveShot";

export const ROUND_DURATION_MS = 60_000;
export const FLICK_TARGET_ID = "flick";
export const TRACK_TARGET_ID = "track";
const TRACKING_POINT_MS = 100;

export type DrillMode = "flicking" | "tracking";
export type RoundPhase = "idle" | "running" | "settled";
export type LastShot = "hit" | "miss" | null;

export type TrackingSample = {
  trackedMs: number;
  windowMs: number;
};

export type DrillRound = {
  mode: DrillMode;
  phase: RoundPhase;
  elapsedMs: number;
  score: number;
  shotsFired: number;
  shotsHit: number;
  kills: number;
  firstShotAttempts: number;
  firstShotHits: number;
  ttkSumMs: number;
  ttkSamples: number;
  trackedMs: number;
  trackingWindowMs: number;
  spawnIndex: number;
  spawnedAtMs: number;
  shotsOnTarget: number;
  lastShot: LastShot;
};

function assertMode(mode: DrillMode): void {
  if (mode !== "flicking" && mode !== "tracking") {
    throw new Error("mode");
  }
}

function requireFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(name);
  }
}

export function createIdleRound(mode: DrillMode): DrillRound {
  assertMode(mode);
  return {
    mode,
    phase: "idle",
    elapsedMs: 0,
    score: 0,
    shotsFired: 0,
    shotsHit: 0,
    kills: 0,
    firstShotAttempts: 0,
    firstShotHits: 0,
    ttkSumMs: 0,
    ttkSamples: 0,
    trackedMs: 0,
    trackingWindowMs: 0,
    spawnIndex: 0,
    spawnedAtMs: 0,
    shotsOnTarget: 0,
    lastShot: null,
  };
}

export function startRound(mode: DrillMode): DrillRound {
  assertMode(mode);
  return { ...createIdleRound(mode), phase: "running" };
}

export function remainingMs(round: Pick<DrillRound, "elapsedMs">): number {
  return Math.max(0, ROUND_DURATION_MS - round.elapsedMs);
}

export function displaySeconds(
  round: Pick<DrillRound, "phase" | "elapsedMs">,
): number {
  if (round.phase === "idle") {
    return ROUND_DURATION_MS / 1000;
  }
  return Math.ceil(remainingMs(round) / 1000);
}

function sanitizeSample(sample: TrackingSample): TrackingSample {
  requireFiniteNonNegative("trackedMs", sample.trackedMs);
  requireFiniteNonNegative("windowMs", sample.windowMs);
  return {
    trackedMs: Math.min(sample.trackedMs, sample.windowMs),
    windowMs: sample.windowMs,
  };
}

export function advanceRound(
  round: DrillRound,
  deltaMs: number,
  sample?: TrackingSample,
): DrillRound {
  requireFiniteNonNegative("deltaMs", deltaMs);
  const clean = sample === undefined ? undefined : sanitizeSample(sample);
  if (round.phase !== "running" || deltaMs === 0) {
    return round;
  }

  const applied = Math.min(ROUND_DURATION_MS - round.elapsedMs, deltaMs);
  let trackedMs = round.trackedMs;
  let trackingWindowMs = round.trackingWindowMs;
  if (clean !== undefined && clean.windowMs > 0 && applied > 0) {
    const addWindow = Math.min(clean.windowMs, applied);
    const ratio = addWindow / clean.windowMs;
    trackedMs += clean.trackedMs * ratio;
    trackingWindowMs += addWindow;
  }

  const elapsedMs = round.elapsedMs + applied;
  return {
    ...round,
    elapsedMs,
    phase: elapsedMs >= ROUND_DURATION_MS ? "settled" : "running",
    trackedMs,
    trackingWindowMs,
    score:
      round.mode === "tracking" ? Math.floor(trackedMs / TRACKING_POINT_MS) : round.score,
  };
}

export function isTrackingCredit(isOnTarget: boolean, isFireHeld: boolean): boolean {
  return isOnTarget && isFireHeld;
}

function isLiveHit(round: DrillRound, result: ShotResult): boolean {
  if (result.kind !== "hit") {
    return false;
  }
  const expected = round.mode === "flicking" ? FLICK_TARGET_ID : TRACK_TARGET_ID;
  return result.targetId === expected;
}

export function applyDrillShot(round: DrillRound, result: ShotResult): DrillRound {
  if (round.phase !== "running") {
    return round;
  }

  const liveHit = isLiveHit(round, result);
  if (round.mode === "tracking") {
    if (!liveHit) {
      return {
        ...round,
        shotsFired: round.shotsFired + 1,
        lastShot: "miss",
      };
    }
    return {
      ...round,
      shotsFired: round.shotsFired + 1,
      shotsHit: round.shotsHit + 1,
      lastShot: "hit",
    };
  }

  if (!liveHit) {
    const isFirstShot = round.shotsOnTarget === 0;
    return {
      ...round,
      shotsFired: round.shotsFired + 1,
      firstShotAttempts: round.firstShotAttempts + (isFirstShot ? 1 : 0),
      shotsOnTarget: round.shotsOnTarget + 1,
      lastShot: "miss",
    };
  }

  const isFirstShot = round.shotsOnTarget === 0;
  return {
    ...round,
    score: round.score + 1,
    shotsFired: round.shotsFired + 1,
    shotsHit: round.shotsHit + 1,
    kills: round.kills + 1,
    firstShotAttempts: round.firstShotAttempts + (isFirstShot ? 1 : 0),
    firstShotHits: round.firstShotHits + (isFirstShot ? 1 : 0),
    ttkSumMs: round.ttkSumMs + (round.elapsedMs - round.spawnedAtMs),
    ttkSamples: round.ttkSamples + 1,
    spawnIndex: round.spawnIndex + 1,
    spawnedAtMs: round.elapsedMs,
    shotsOnTarget: 0,
    lastShot: "hit",
  };
}

export function averageTtkMs(round: Pick<DrillRound, "ttkSumMs" | "ttkSamples">): number | null {
  if (round.ttkSamples === 0) {
    return null;
  }
  return round.ttkSumMs / round.ttkSamples;
}

export function firstShotRate(
  round: Pick<DrillRound, "firstShotHits" | "firstShotAttempts">,
): number | null {
  if (round.firstShotAttempts === 0) {
    return null;
  }
  return round.firstShotHits / round.firstShotAttempts;
}

export function hitRate(round: Pick<DrillRound, "shotsHit" | "shotsFired">): number | null {
  if (round.shotsFired === 0) {
    return null;
  }
  return round.shotsHit / round.shotsFired;
}

export function trackingUptime(
  round: Pick<DrillRound, "trackedMs" | "trackingWindowMs">,
): number | null {
  if (round.trackingWindowMs === 0) {
    return null;
  }
  return round.trackedMs / round.trackingWindowMs;
}
