const BUCKET_MS = 1000;
const STOP_MS = 280;
const SLIDE_MS = 220;
const SLIDE_AHEAD_MS = 120;
const LANE_HALF_WIDTH = 3.2;
const TRACK_Z = -8;

function unitHash(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function signedHash(n: number): number {
  return unitHash(n) * 2 - 1;
}

function smootherstep(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function cruiseUnit(elapsedMs: number): number {
  const bucket = Math.floor(elapsedMs / BUCKET_MS);
  const into = elapsedMs - bucket * BUCKET_MS;
  const from = signedHash(bucket);
  const to = signedHash(bucket + 1);
  const lerp = from + (to - from) * smootherstep(into / BUCKET_MS);
  const sine = Math.sin((elapsedMs / 2400) * Math.PI * 2) * 0.35;
  return Math.min(1, Math.max(-1, lerp * 0.75 + sine));
}

function baseX(elapsedMs: number): number {
  return cruiseUnit(elapsedMs) * LANE_HALF_WIDTH;
}

function stopPauseMs(elapsedMs: number): number {
  let paused = 0;
  const lastBucket = Math.floor(elapsedMs / BUCKET_MS);
  for (let bucket = 3; bucket <= lastBucket; bucket += 4) {
    const start = bucket * BUCKET_MS;
    if (elapsedMs <= start) {
      break;
    }
    paused += Math.min(STOP_MS, elapsedMs - start);
  }
  return paused;
}

function slideAheadMs(elapsedMs: number): number {
  let ahead = 0;
  const lastBucket = Math.floor(elapsedMs / BUCKET_MS);
  for (let bucket = 2; bucket <= lastBucket; bucket += 5) {
    const slideStart = bucket * BUCKET_MS + (BUCKET_MS - SLIDE_MS);
    if (elapsedMs <= slideStart) {
      break;
    }
    const progress = Math.min(1, (elapsedMs - slideStart) / SLIDE_MS);
    ahead += SLIDE_AHEAD_MS * smootherstep(progress);
  }
  return ahead;
}

export function trackingPose(elapsedMs: number): { x: number; z: number } {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new Error("elapsedMs");
  }

  const warpedMs = Math.max(0, elapsedMs - stopPauseMs(elapsedMs) + slideAheadMs(elapsedMs));
  return { x: baseX(warpedMs), z: TRACK_Z };
}
