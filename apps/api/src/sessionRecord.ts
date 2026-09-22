import {
  DEFAULT_YAW_FACTOR,
  resolveLookSettings,
} from "@delta-aim/aim-math";

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type DrillMode = "flicking" | "tracking";
export type OpticId = "redDot" | "scope2x";

export type NewSession = {
  mode: DrillMode;
  optic: OpticId;
  score: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  avgReactionMs: number | null;
  trackingUptime: number | null;
  dpi: number;
  sens: number;
  hFovDeg: number;
};

export type StoredSession = {
  id: string;
  createdAt: Date;
  mode: DrillMode;
  optic: OpticId;
  score: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  avgReactionMs: number | null;
  trackingUptime: number | null;
};

export type AccuracyPoint = {
  id: string;
  createdAt: string;
  mode: DrillMode;
  accuracy: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireInteger(name: string, value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(name);
  }
  return value;
}

function requireMode(value: unknown): DrillMode {
  if (value !== "flicking" && value !== "tracking") {
    throw new Error("mode");
  }
  return value;
}

function requireOptic(value: unknown): OpticId {
  if (value !== "redDot" && value !== "scope2x") {
    throw new Error("optic");
  }
  return value;
}

function requireNullableDuration(value: unknown): number | null {
  if (value === null) {
    return null;
  }
  return requireInteger("avgReactionMs", value);
}

function requireNullableUptime(value: unknown): number | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error("trackingUptime");
  }
  return value;
}

export function parseNewSession(input: unknown): NewSession {
  if (!isRecord(input)) {
    throw new Error("body");
  }

  const shotsFired = requireInteger("shotsFired", input.shotsFired);
  const shotsHit = requireInteger("shotsHit", input.shotsHit);
  if (shotsHit > shotsFired) {
    throw new Error("shotsHit exceeds shotsFired");
  }

  const look = resolveLookSettings({
    dpi: typeof input.dpi === "number" ? input.dpi : Number.NaN,
    sens: typeof input.sens === "number" ? input.sens : Number.NaN,
    hFovDeg: typeof input.hFovDeg === "number" ? input.hFovDeg : Number.NaN,
    yawFactor: DEFAULT_YAW_FACTOR,
  });
  if (!Number.isInteger(look.dpi)) {
    throw new Error("dpi");
  }

  return {
    mode: requireMode(input.mode),
    optic: requireOptic(input.optic),
    score: requireInteger("score", input.score),
    shotsFired,
    shotsHit,
    accuracy: shotsFired === 0 ? 0 : shotsHit / shotsFired,
    avgReactionMs: requireNullableDuration(input.avgReactionMs),
    trackingUptime: requireNullableUptime(input.trackingUptime),
    dpi: look.dpi,
    sens: look.sens,
    hFovDeg: look.hFovDeg,
  };
}

export function weeklyAccuracyPoints(
  sessions: StoredSession[],
  now: Date,
): AccuracyPoint[] {
  const start = now.getTime() - WEEK_MS;
  const end = now.getTime();
  return sessions
    .filter((session) => {
      const time = session.createdAt.getTime();
      return time >= start && time <= end;
    })
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
    .map((session) => ({
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      mode: session.mode,
      accuracy: session.accuracy,
    }));
}
